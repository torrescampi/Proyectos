package com.aluracursos.screenmatch.service;

import com.theokanning.openai.completion.CompletionRequest;
import com.theokanning.openai.service.OpenAiService;

    public class ConsultaChatGPT {
        public static String obtenerTraduccion(String texto) {
            OpenAiService service = new OpenAiService("sk-proj-dDdHu6DrnOYxXk-" +
                    "uSEHbi20elAk0d8HiWiDX8LZfJwl2kBNroUgGlIM4RPmM6LSoGFf_" +
                    "XvPd4jT3BlbkFJb29kUGxnfSDBWzvs8f7Eud74lCBlNAlmsQHcOqomAbLBaHmY3jcxGJUAqkVXe-" +
                    "sAbevVZyeaUA");

            CompletionRequest requisicion = CompletionRequest.builder()
                    .model("gpt-4o-mini")
                    .prompt("traduce a español el siguiente texto: " + texto)
                    .maxTokens(1000)
                    .temperature(0.7)
                    .build();

            var respuesta = service.createCompletion(requisicion);
            return respuesta.getChoices().get(0).getText();
        }
    }
