package com.conliz.platform;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Garante que as migrations do Flyway (V1→V4) aplicam de ponta a ponta.
 *
 * <p>O perfil {@code test} padrão desliga o Flyway e usa {@code ddl-auto: create-drop},
 * então um SQL inválido só aparecia no primeiro boot de produção. Este teste sobe o
 * contexto com o Flyway ligado num H2 em modo PostgreSQL: se uma migration tiver UUID
 * inválido, coluna inexistente ou sintaxe que o H2 não aceita, o build falha antes do
 * deploy.</p>
 */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:conliz-flyway;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.flyway.enabled=true",
        "spring.flyway.locations=classpath:db/migration",
        "spring.jpa.hibernate.ddl-auto=validate",
        "conliz.admin.password=",
        "conliz.rate-limit.login-capacity=1000",
        "conliz.rate-limit.ip-capacity=1000"
})
@ActiveProfiles("test")
class FlywayMigrationTest {

    @Test
    void migrationsAplicamEContextoSobe() {
        // O contexto subir já é a verificação: o Flyway roda no boot e o
        // Hibernate valida o schema resultante (ddl-auto=validate).
    }
}
