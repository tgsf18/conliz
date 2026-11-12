package com.conliz.platform.repository;

import com.conliz.platform.domain.Obra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ObraRepository extends JpaRepository<Obra, UUID> {
    List<Obra> findByPublicaTrueOrderByAnoConclusaoDescCriadoEmDesc();
    List<Obra> findByPublicaTrueAndCategoriaIgnoreCase(String categoria);

    @Query("SELECT o FROM Obra o LEFT JOIN FETCH o.fotos WHERE o.slug = :slug AND o.publica = true")
    Optional<Obra> findBySlugAndPublicaTrue(String slug);

    Optional<Obra> findBySlug(String slug);
}
