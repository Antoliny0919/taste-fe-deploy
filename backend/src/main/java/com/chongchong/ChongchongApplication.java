package com.chongchong;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 총총 배포 POC용 최소 백엔드.
 *
 * 이 파일 하나가 전부입니다. Spring을 몰라도 됩니다.
 * - 프론트가 살아있는 백엔드에 실제로 붙는지 확인하는 용도
 * - 엔드포인트는 GET /api/health 단 하나
 *
 * 실행:  ./gradlew bootRun      (backend 폴더에서)
 */
@SpringBootApplication
public class ChongchongApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChongchongApplication.class, args);
    }

    /**
     * 프론트엔드가 호출하는 유일한 API.
     * 응답에 서버 시각이 들어있어서, 화면의 값이 바뀌면 "진짜 서버에 다녀왔다"는 증거가 됩니다.
     */
    @RestController
    @RequestMapping("/api")
    static class HealthController {

        @Value("${app.deploy-target:unknown}")
        private String deployTarget;

        @GetMapping("/health")
        public Map<String, Object> health() {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("status", "UP");
            body.put("service", "chongchong-backend");
            body.put("deployTarget", deployTarget);
            body.put("serverTime", OffsetDateTime.now().toString());
            return body;
        }
    }

    /**
     * CORS 설정.
     *
     * ▶ EC2 버전(버전 2): nginx가 같은 도메인에서 /api를 넘겨주므로 이 설정이 필요 없습니다.
     * ▶ S3 버전(버전 1): 프론트 도메인이 달라서 이 설정이 없으면 브라우저가 요청을 차단합니다.
     *
     * 허용할 주소는 application.properties 의 app.cors.allowed-origins 에서 바꿉니다.
     * (자바 코드를 고칠 필요 없습니다)
     */
    @Bean
    WebMvcConfigurer corsConfigurer(@Value("${app.cors.allowed-origins}") String[] allowedOrigins) {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOriginPatterns(allowedOrigins)
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
