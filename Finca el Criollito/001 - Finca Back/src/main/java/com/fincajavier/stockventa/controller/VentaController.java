package com.fincajavier.stockventa.controller;

import com.fincajavier.stockventa.dto.VentaDTO;
import com.fincajavier.stockventa.service.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500"})
public class VentaController {

    @Autowired
    private VentaService ventaService;

    @GetMapping
    public ResponseEntity<List<VentaDTO>> obtenerTodasLasVentas() {
        try {
            List<VentaDTO> ventas = ventaService.obtenerTodasLasVentas();
            return ResponseEntity.ok(ventas);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}