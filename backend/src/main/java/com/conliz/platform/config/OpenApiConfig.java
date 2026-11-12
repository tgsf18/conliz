package com.conliz.platform.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI conlizOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Conliz Construtora - SaaS Platform API")
                        .description("API RESTful de alta segurança para gestão de obras, orçamentos, contratos, RH e materiais.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Suporte Técnico Conliz")
                                .email("suporte@conliz.com.br")
                        )
                )
                .addSecurityItem(new SecurityRequirement().addList("CookieAuth").addList("BearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("CookieAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.COOKIE)
                                .name("conliz_access_token")
                                .description("JWT Access Token via cookie HttpOnly")
                        )
                        .addSecuritySchemes("BearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Fallback para chamadas de API autenticadas via header")
                        )
                );
    }
}
