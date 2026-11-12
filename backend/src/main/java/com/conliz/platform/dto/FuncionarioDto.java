package com.conliz.platform.dto;

import com.conliz.platform.domain.Funcionario;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record FuncionarioDto(
        UUID id,
        String nome,
        String cpf,
        String email,
        String telefone,
        String cargo,
        String departamento,
        LocalDate dataAdmissao,
        LocalDate dataDemissao,
        String status,
        BigDecimal salarioBase,
        UUID obraAtualId,
        LocalDateTime criadoEm
) {
    /** CPF mascarado para listagem (***.123.456-**), evitando exposição de dado sensível na tela. */
    public static FuncionarioDto from(Funcionario funcionario) {
        return new FuncionarioDto(
                funcionario.getId(),
                funcionario.getNome(),
                maskCpf(funcionario.getCpf()),
                funcionario.getEmail(),
                funcionario.getTelefone(),
                funcionario.getCargo(),
                funcionario.getDepartamento(),
                funcionario.getDataAdmissao(),
                funcionario.getDataDemissao(),
                funcionario.getStatus(),
                funcionario.getSalarioBase(),
                funcionario.getObraAtualId(),
                funcionario.getCriadoEm()
        );
    }

    static String maskCpf(String cpf) {
        if (cpf == null) return null;
        String digits = cpf.replaceAll("\\D", "");
        if (digits.length() != 11) return "***";
        return "***." + digits.substring(3, 6) + "." + digits.substring(6, 9) + "-**";
    }
}
