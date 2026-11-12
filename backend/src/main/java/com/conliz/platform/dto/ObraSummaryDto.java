package com.conliz.platform.dto;

import com.conliz.platform.domain.Obra;
import com.conliz.platform.domain.ObraFoto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ObraSummaryDto(
        UUID id,
        String nome,
        String slug,
        String categoria,
        String localizacao,
        String cidade,
        String uf,
        BigDecimal areaM2,
        Integer anoConclusao,
        BigDecimal percentualConcluido,
        String faseAtual,
        String imagemCapaUrl
) {
    public static ObraSummaryDto fromEntity(Obra obra) {
        return new ObraSummaryDto(
                obra.getId(),
                obra.getNome(),
                obra.getSlug(),
                obra.getCategoria(),
                obra.getLocalizacao(),
                obra.getCidade(),
                obra.getUf(),
                obra.getAreaM2(),
                obra.getAnoConclusao(),
                obra.getPercentualConcluido(),
                obra.getFaseAtual(),
                obra.getImagemCapaUrl()
        );
    }
}
