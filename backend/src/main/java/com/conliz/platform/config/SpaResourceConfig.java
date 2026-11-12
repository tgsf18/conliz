package com.conliz.platform.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Serve o painel/site (exportação estática do Next) direto pelo Spring Boot.
 *
 * <p>O build do frontend copia {@code out/} para {@code classpath:/static}. As rotas
 * do Next usam {@code trailingSlash}, então {@code /admin/rh/} resolve para
 * {@code static/admin/rh/index.html}. Quando o caminho não existe como arquivo,
 * devolvemos {@code index.html} para o roteador do Next tratar.
 *
 * <p>Caminhos de backend ({@code /api}, {@code /actuator}, Swagger) ficam de fora:
 * a API precisa responder JSON (inclusive 404 JSON), nunca HTML do SPA.
 */
@Configuration
public class SpaResourceConfig implements WebMvcConfigurer {

    private static final Resource INDEX = new ClassPathResource("static/index.html");

    private static final String[] BACKEND_PREFIXES = {
            "api", "actuator", "swagger-ui", "v3", "error"
    };

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        String path = resourcePath == null ? "" : resourcePath;

                        // 1. Nunca servir HTML para rotas de backend.
                        for (String prefix : BACKEND_PREFIXES) {
                            if (path.equals(prefix) || path.startsWith(prefix + "/")) {
                                return null;
                            }
                        }

                        // 2. Arquivo estático real (assets, imagens, chunks do Next).
                        Resource requested = location.createRelative(path);
                        if (requested.exists() && requested.isReadable()) {
                            return requested;
                        }

                        // 3. Diretório sem barra final (ex.: /admin/rh -> /admin/rh/index.html).
                        Resource directoryIndex = location.createRelative(path + "/index.html");
                        if (directoryIndex.exists() && directoryIndex.isReadable()) {
                            return directoryIndex;
                        }

                        // 4. Caminho com extensão que não existe: 404 de verdade.
                        String last = path.substring(path.lastIndexOf('/') + 1);
                        if (last.contains(".")) {
                            return null;
                        }

                        // 5. Rota do Next: entrega o index.html e o roteador decide.
                        return INDEX.exists() ? INDEX : null;
                    }
                });
    }
}
