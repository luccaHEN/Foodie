package com.foodie.delivery.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        // Imprime o erro real no console do Java para nos ajudar a debugar!
        ex.printStackTrace();

        final String message = ex.getMessage();
        HttpStatus status = HttpStatus.BAD_REQUEST; // 400 por padrão

        if (message != null) {
            if (message.contains("Credenciais") || message.contains("Token")) {
                status = HttpStatus.UNAUTHORIZED; // 401
            } else if (message.contains("Acesso negado") || message.contains("dono")) {
                status = HttpStatus.FORBIDDEN; // 403
            } else if (message.contains("encontrado")) { // Removido o 'não' para evitar bugs de charset
                status = HttpStatus.NOT_FOUND; // 404
            } else if (message.contains("cadastrado")) { // Removido o 'já' para evitar bugs de charset
                status = HttpStatus.CONFLICT; // 409
            } else if (message.contains("incorreto") || message.contains("lido")) { // 'lido' pega a palavra 'inválido'
                // Outros erros de negócio que devem retornar 400 (Bad Request)
                status = HttpStatus.BAD_REQUEST;
            } else {
                // Se for um erro que não conhecemos, vira erro 500!
                status = HttpStatus.INTERNAL_SERVER_ERROR;
            }
        }

        return ResponseEntity.status(status).body(Map.of("status", "error", "message", message != null ? message : "Erro desconhecido"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        var issues = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> Map.of("field", error.getField(), "message", error.getDefaultMessage()))
                .collect(Collectors.toList());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("status", "error", "message", "Erro de validação", "issues", issues));
    }

    // Captura erros de formatação na URL (Ex: ID não é um UUID válido)
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, String>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        ex.printStackTrace(); // Log no console
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("status", "error", "message", "Parâmetro inválido na URL: " + ex.getValue()));
    }

    // Captura TODOS os outros erros e evita que o backend morra silenciosamente
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAllExceptions(Exception ex) {
        ex.printStackTrace(); // Log no console de qualquer outro erro não tratado
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("status", "error", "message", "Erro interno: " + ex.getMessage()));
    }
}