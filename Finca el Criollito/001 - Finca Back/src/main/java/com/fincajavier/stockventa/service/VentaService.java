package com.fincajavier.stockventa.service;

import com.fincajavier.stockventa.dto.DetalleVentaDTO;
import com.fincajavier.stockventa.dto.VentaDTO;
import com.fincajavier.stockventa.model.DetalleVenta;
import com.fincajavier.stockventa.model.Venta;
import com.fincajavier.stockventa.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VentaService {

    @Autowired
    private VentaRepository ventaRepository;

    public List<VentaDTO> obtenerTodasLasVentas() {
        List<Venta> ventas = ventaRepository.findAllByOrderByFechaVentaDesc();
        return ventas.stream()
                .map(this::convertirAVentaDTO)
                .collect(Collectors.toList());
    }

    public Venta guardarVenta(Venta venta) {
        return ventaRepository.save(venta);
    }

    private VentaDTO convertirAVentaDTO(Venta venta) {
        List<DetalleVentaDTO> detallesDTO = venta.getDetalles().stream()
                .map(this::convertirADetalleVentaDTO)
                .collect(Collectors.toList());

        return new VentaDTO(
                venta.getId(),
                venta.getFechaVenta(),
                venta.getTotalVenta(),
                detallesDTO
        );
    }

    private DetalleVentaDTO convertirADetalleVentaDTO(DetalleVenta detalle) {
        return new DetalleVentaDTO(
                detalle.getCodigoProducto(),
                detalle.getNombreProducto(),
                detalle.getCantidad(),
                detalle.getPrecioUnitario(),
                detalle.getSubtotal()
        );
    }
}