package com.conliz.platform.repository;

import com.conliz.platform.domain.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FuncionarioRepository extends JpaRepository<Funcionario, UUID> {
    List<Funcionario> findByStatusOrderByNomeAsc(String status);
    Optional<Funcionario> findByCpf(String cpf);
    long countByStatus(String status);

    @Query("SELECT f.departamento AS departamento, COUNT(f) AS total FROM Funcionario f WHERE f.status = 'ATIVO' GROUP BY f.departamento")
    List<Map<String, Object>> countHeadcountByDepartment();
}
