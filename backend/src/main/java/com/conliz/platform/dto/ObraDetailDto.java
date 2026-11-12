package com.conliz.platform.dto;

import com.conliz.platform.domain.Obra;
import com.conliz.platform.domain.ObraFoto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ObraDetailDto(
        UUID id,
        String nome,
        String slug,
        String categoria,
        String descricao,
        String localizacao,
        String cidade,
        String uf,
        BigDecimal areaM2,
        Integer anoConclusao,
        BigDecimal percentualConcluido,
        String faseAtual,
        String imagemCapaUrl,
        List<FotoDto> fotos,
        AntesDepoisDto antesDepois
) {
    public record FotoDto(UUID id, String url, String legenda, boolean ehAntesDepois, boolean ehAntes, int ordem) {}
    public record AntesDepoisDto(String antesUrl, String depoisUrl, String legenda) {}

    public static ObraDetailDto fromEntity(Obra obra) {
        List<FotoDto> fotosDto = obra.getFotos().stream()
                .map(f -> new FotoDto(f.getId(), f.getUrl(), f.getLegenda(), f.isEhAntesDepois(), f.isEhAntes(), f.getOrdem()))
                .toList();

        AntesDepoisDto antesDepois = null;
        String antesUrl = null;
        String depoisUrl = null;
        String legendaAd = null;

        for (ObraFoto f : obra.getFotos()) {
            if (f.isEhAntesDepois()) {
                if (f.isEhAntes() && antesUrl == null) {
                    antesUrl = f.getUrl();
                    legendaAd = f.getLegenda();
                } else if (!f.isEhAntes() && depoisUrl == null) {
                    depoisUrl = f.getUrl();
                }
            }
        }

        if (antesUrl != null && depoisUrl != null) {
            antesDepois = new AntesDepoisDto(antesUrl, depoisUrl, legendaAd);
        }

        return new ObraDetailDto(
                obra.getId(),
                obra.getNome(),
                obra.getSlug(),
                obra.getCategoria(),
                obra.getDescricao(),
                obra.getLocalizacao(),
                obra.getCidade(),
                obra.getUf(),
                obra.getAreaM2(),
                obra.getAnoConclusao(),
                obra.getPercentualConcluido(),
                obra.getFaseAtual(),
                obra.getImagemCapaUrl(),
                fotosDto,
                antesDepois
        );
    }
}
