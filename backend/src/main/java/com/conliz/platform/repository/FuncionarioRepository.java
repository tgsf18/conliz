package com.conliz.platform.repository;

import com.conliz.platform.domain.Funcionario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FuncionarioRepository extends JpaRepository<Funcionario, UUID> {
    List<Funcionario> findByStatusOrderByNomeAsc(String status);
    Optional<Funcionario> findByCpf(String cpf);
    long countByStatus(String status);
    boolean existsByCpf(String cpf);

    @Query("SELECT f.departamento AS departamento, COUNT(f) AS total FROM Funcionario f WHERE f.status = 'ATIVO' GROUP BY f.departamento")
    List<Map<String, Object>> countHeadcountByDepartment();

    @Query("""
            SELECT f FROM Funcionario f
            WHERE (:status IS NULL OR f.status = :status)
              AND (:departamento IS NULL OR f.departamento = :departamento)
              AND (:termo IS NULL OR LOWER(f.nome) LIKE LOWER(CONCAT('%', :termo, '%'))
                   OR LOWER(f.cargo) LIKE LOWER(CONCAT('%', :termo, '%')))
            """)
    Page<Funcionario> search(@Param("status") String status,
                             @Param("departamento") String departamento,
                             @Param("termo") String termo,
                             Pageable pageable);

    @Query("SELECT COALESCE(SUM(f.salarioBase), 0) FROM Funcionario f WHERE f.status = 'ATIVO'")
    BigDecimal sumFolhaAtiva();

    @Query("SELECT COUNT(f) FROM Funcionario f WHERE f.dataAdmissao >= :desde")
    long countAdmitidosDesde(@Param("desde") LocalDate desde);

    @Query("""
            SELECT f.departamento AS departamento, COUNT(f) AS total, COALESCE(SUM(f.salarioBase), 0) AS folha
            FROM Funcionario f
            WHERE f.status = 'ATIVO'
            GROUP BY f.departamento
            ORDER BY f.departamento
            """)
    List<Object[]> sumFolhaPorDepartamento();

    @Query("SELECT DISTINCT f.departamento FROM Funcionario f ORDER BY f.departamento")
    List<String> findDepartamentos();
}
