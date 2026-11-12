package com.conliz.platform.service;

import com.conliz.platform.domain.Orcamento;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class PdfProposalService {

    private final Color terracottaColor = new Color(166, 94, 63);   // #A65E3F
    private final Color charcoalColor = new Color(42, 38, 34);       // #2A2622
    private final Color linenColor = new Color(243, 236, 226);       // #F3ECE2
    private final Color hairlineColor = new Color(228, 222, 216);    // #E4DED8

    private final NumberFormat currencyFormatter = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("pt-BR"));
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public byte[] generateProposalPdf(Orcamento orcamento) {
        Document document = new Document(PageSize.A4, 40, 40, 40, 40);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, charcoalColor);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, terracottaColor);
            Font sectionTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, terracottaColor);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10, charcoalColor);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, charcoalColor);
            Font mutedFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.GRAY);

            // 1. HEADER TABLE
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{65, 35});

            // Brand cell
            PdfPCell brandCell = new PdfPCell();
            brandCell.setBorder(Rectangle.NO_BORDER);
            brandCell.addElement(new Paragraph("CONLIZ CONSTRUÇÕES", titleFont));
            brandCell.addElement(new Paragraph("A CONFIANÇA SE CONSTRÓI • ENGENHARIA & REFORMAS", subtitleFont));
            brandCell.addElement(new Paragraph("Sorocaba, Votorantim e Região • (15) 99715-1520", mutedFont));
            headerTable.addCell(brandCell);

            // Proposal Meta cell
            PdfPCell metaCell = new PdfPCell();
            metaCell.setBorder(Rectangle.NO_BORDER);
            metaCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            metaCell.setBackgroundColor(linenColor);
            metaCell.setPadding(10);
            Paragraph metaText = new Paragraph();
            metaText.add(new Chunk("PROPOSTA COMERCIAL\n", sectionTitleFont));
            metaText.add(new Chunk("Código: " + orcamento.getCodigo() + "\n", boldFont));
            metaText.add(new Chunk("Data: " + orcamento.getCriadoEm().format(dateFormatter) + "\n", bodyFont));
            metaText.add(new Chunk("Status: " + orcamento.getStatus(), boldFont));
            metaCell.addElement(metaText);
            headerTable.addCell(metaCell);

            document.add(headerTable);
            document.add(new Paragraph(" "));

            // Hairline separator
            PdfPTable divider = new PdfPTable(1);
            divider.setWidthPercentage(100);
            PdfPCell lineCell = new PdfPCell();
            lineCell.setBackgroundColor(terracottaColor);
            lineCell.setFixedHeight(2f);
            lineCell.setBorder(Rectangle.NO_BORDER);
            divider.addCell(lineCell);
            document.add(divider);
            document.add(new Paragraph(" "));

            // 2. CLIENT INFO TABLE
            PdfPTable clientTable = new PdfPTable(2);
            clientTable.setWidthPercentage(100);
            clientTable.setWidths(new float[]{50, 50});

            PdfPCell c1 = new PdfPCell();
            c1.setBorder(Rectangle.BOX);
            c1.setBorderColor(hairlineColor);
            c1.setPadding(8);
            c1.addElement(new Paragraph("DADOS DO CLIENTE / SOLICITANTE", sectionTitleFont));
            c1.addElement(new Paragraph("Nome: " + orcamento.getNomeSolicitante(), boldFont));
            c1.addElement(new Paragraph("E-mail: " + orcamento.getEmailSolicitante(), bodyFont));
            c1.addElement(new Paragraph("Telefone: " + orcamento.getTelefoneSolicitante(), bodyFont));
            clientTable.addCell(c1);

            PdfPCell c2 = new PdfPCell();
            c2.setBorder(Rectangle.BOX);
            c2.setBorderColor(hairlineColor);
            c2.setPadding(8);
            c2.addElement(new Paragraph("LOCAL DA OBRA / EDIFICAÇÃO", sectionTitleFont));
            c2.addElement(new Paragraph("Tipo de Obra: " + orcamento.getTipoObra(), boldFont));
            c2.addElement(new Paragraph("Área Estimada: " + (orcamento.getAreaM2() != null ? orcamento.getAreaM2() + " m²" : "A definir"), bodyFont));
            c2.addElement(new Paragraph("Local: " + orcamento.getCidade() + " / " + orcamento.getEstado(), bodyFont));
            clientTable.addCell(c2);

            document.add(clientTable);
            document.add(new Paragraph(" "));

            // 3. SCOPE DESCRIPTION
            PdfPTable scopeTable = new PdfPTable(1);
            scopeTable.setWidthPercentage(100);
            PdfPCell scopeCell = new PdfPCell();
            scopeCell.setBorder(Rectangle.BOX);
            scopeCell.setBorderColor(hairlineColor);
            scopeCell.setPadding(10);
            scopeCell.addElement(new Paragraph("MEMORIAL DESCRITIVO & ESCOPO DA PROPOSTA", sectionTitleFont));
            scopeCell.addElement(new Paragraph(" "));
            scopeCell.addElement(new Paragraph(orcamento.getDescricao(), bodyFont));
            if (orcamento.getAnexosUrls() != null && !orcamento.getAnexosUrls().isBlank()) {
                scopeCell.addElement(new Paragraph(" "));
                scopeCell.addElement(new Paragraph("Pranchas e Anexos de Referência: " + orcamento.getAnexosUrls(), mutedFont));
            }
            scopeTable.addCell(scopeCell);
            document.add(scopeTable);
            document.add(new Paragraph(" "));

            // 4. FINANCIAL INVESTMENT SUMMARY
            BigDecimal valor = orcamento.getValorEstimado() != null ? orcamento.getValorEstimado() : BigDecimal.valueOf(185000.00);
            BigDecimal valorMateriais = valor.multiply(BigDecimal.valueOf(0.55));
            BigDecimal valorMaoDeObra = valor.multiply(BigDecimal.valueOf(0.35));
            BigDecimal valorGestao = valor.multiply(BigDecimal.valueOf(0.10));

            PdfPTable financeTable = new PdfPTable(2);
            financeTable.setWidthPercentage(100);
            financeTable.setWidths(new float[]{70, 30});

            PdfPCell fHeader1 = new PdfPCell(new Phrase("DISCRIMINAÇÃO TÉCNICA", boldFont));
            fHeader1.setBackgroundColor(linenColor);
            fHeader1.setPadding(6);
            financeTable.addCell(fHeader1);

            PdfPCell fHeader2 = new PdfPCell(new Phrase("VALOR ESTIMADO", boldFont));
            fHeader2.setBackgroundColor(linenColor);
            fHeader2.setHorizontalAlignment(Element.ALIGN_RIGHT);
            fHeader2.setPadding(6);
            financeTable.addCell(fHeader2);

            addFinanceRow(financeTable, "Materiais Certificados & Insumos Estruturais", currencyFormatter.format(valorMateriais), bodyFont);
            addFinanceRow(financeTable, "Mão de Obra Especializada & Equipe Própria", currencyFormatter.format(valorMaoDeObra), bodyFont);
            addFinanceRow(financeTable, "Gestão de Obra, ART/CREA & Diário em Tempo Real", currencyFormatter.format(valorGestao), bodyFont);

            PdfPCell totalLabel = new PdfPCell(new Phrase("INVESTIMENTO TOTAL ESTIMADO", sectionTitleFont));
            totalLabel.setBackgroundColor(linenColor);
            totalLabel.setPadding(8);
            financeTable.addCell(totalLabel);

            PdfPCell totalVal = new PdfPCell(new Phrase(currencyFormatter.format(valor), sectionTitleFont));
            totalVal.setBackgroundColor(linenColor);
            totalVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalVal.setPadding(8);
            financeTable.addCell(totalVal);

            document.add(financeTable);
            document.add(new Paragraph(" "));

            // 5. CONDITIONS & WARRANTIES
            Paragraph terms = new Paragraph();
            terms.add(new Chunk("CONDIÇÕES GERAIS E GARANTIAS\n", sectionTitleFont));
            terms.add(new Chunk("• Validade desta proposta: 15 dias corridos a partir da data de emissão.\n", mutedFont));
            terms.add(new Chunk("• Emissão formal de ART (Anotação de Responsabilidade Técnica) junto ao CREA-SP inclusa.\n", mutedFont));
            terms.add(new Chunk("• Cronograma físico-financeiro detalhado com medições periódicas mediante entrega de etapas.\n", mutedFont));
            terms.add(new Chunk("• Garantia legal de 5 anos para elementos estruturais e impermeabilizações conforme NBR.\n", mutedFont));
            document.add(terms);
            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));

            // 6. SIGNATURES
            PdfPTable signTable = new PdfPTable(2);
            signTable.setWidthPercentage(100);

            PdfPCell sign1 = new PdfPCell();
            sign1.setBorder(Rectangle.NO_BORDER);
            sign1.setHorizontalAlignment(Element.ALIGN_CENTER);
            sign1.addElement(new Paragraph("_____________________________________\nCONLIZ CONSTRUÇÕES LTDA\nEngenheiro Responsável CREA-SP", mutedFont));
            signTable.addCell(sign1);

            PdfPCell sign2 = new PdfPCell();
            sign2.setBorder(Rectangle.NO_BORDER);
            sign2.setHorizontalAlignment(Element.ALIGN_CENTER);
            sign2.addElement(new Paragraph("_____________________________________\n" + orcamento.getNomeSolicitante() + "\nDe Acordo do Contratante", mutedFont));
            signTable.addCell(sign2);

            document.add(signTable);

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Erro ao gerar proposta PDF", e);
        }

        return out.toByteArray();
    }

    private void addFinanceRow(PdfPTable table, String desc, String value, Font font) {
        PdfPCell c1 = new PdfPCell(new Phrase(desc, font));
        c1.setPadding(6);
        c1.setBorderColor(hairlineColor);
        table.addCell(c1);

        PdfPCell c2 = new PdfPCell(new Phrase(value, font));
        c2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        c2.setPadding(6);
        c2.setBorderColor(hairlineColor);
        table.addCell(c2);
    }
}
