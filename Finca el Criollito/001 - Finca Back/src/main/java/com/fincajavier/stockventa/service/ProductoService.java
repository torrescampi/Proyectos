package com.fincajavier.stockventa.service;

import com.fincajavier.stockventa.dto.VentaRequest;
import com.fincajavier.stockventa.dto.VentaResponse;
import com.fincajavier.stockventa.model.DetalleVenta;
import com.fincajavier.stockventa.model.Producto;
import com.fincajavier.stockventa.model.Venta;
import com.fincajavier.stockventa.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private VentaService ventaService;

    public List<Producto> obtenerTodosLosProductos() {
        return productoRepository.findAll();
    }

    public Optional<Producto> obtenerProductoPorId(Long id) {
        return productoRepository.findById(id);
    }

    public Optional<Producto> obtenerProductoPorCodigo(String codigo) {
        return productoRepository.findByCodigo(codigo);
    }

    public Producto crearProducto(Producto producto) {
        if (productoRepository.existsByCodigo(producto.getCodigo())) {
            throw new RuntimeException("Ya existe un producto con el código: " + producto.getCodigo());
        }
        return productoRepository.save(producto);
    }

    public Producto actualizarProducto(Long id, Producto productoActualizado) {
        Producto productoExistente = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));

        if (!productoExistente.getCodigo().equals(productoActualizado.getCodigo()) &&
                productoRepository.existsByCodigo(productoActualizado.getCodigo())) {
            throw new RuntimeException("Ya existe un producto con el código: " + productoActualizado.getCodigo());
        }

        productoExistente.setCodigo(productoActualizado.getCodigo());
        productoExistente.setNombre(productoActualizado.getNombre());
        productoExistente.setCantidad(productoActualizado.getCantidad());
        productoExistente.setPrecio(productoActualizado.getPrecio());

        return productoRepository.save(productoExistente);
    }

    public void eliminarProducto(Long id) {
        if (!productoRepository.existsById(id)) {
            throw new RuntimeException("Producto no encontrado con ID: " + id);
        }
        productoRepository.deleteById(id);
    }

    public boolean existeProductoPorCodigo(String codigo) {
        return productoRepository.existsByCodigo(codigo);
    }

    // VENTA INDIVIDUAL
    @Transactional
    public Producto venderProducto(String codigo, Integer cantidadVendida) {
        Producto producto = productoRepository.findByCodigo(codigo)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con código: " + codigo));

        if (producto.getCantidad() < cantidadVendida) {
            throw new RuntimeException("Stock insuficiente. Stock actual: " + producto.getCantidad() +
                    ", solicitado: " + cantidadVendida);
        }

        // Calcular total
        Double totalVenta = producto.getPrecio() * cantidadVendida;

        // Crear venta
        Venta venta = new Venta(totalVenta);
        DetalleVenta detalle = new DetalleVenta(
                producto.getCodigo(),
                producto.getNombre(),
                cantidadVendida,
                producto.getPrecio()
        );
        venta.agregarDetalle(detalle);
        ventaService.guardarVenta(venta);

        // Actualizar stock
        producto.setCantidad(producto.getCantidad() - cantidadVendida);
        return productoRepository.save(producto);
    }

    // VENTA MÚLTIPLE
    @Transactional
    public VentaResponse procesarVentaMultiple(VentaRequest ventaRequest) {
        Venta venta = new Venta();
        List<DetalleVenta> detalles = new ArrayList<>();

        for (VentaRequest.DetalleVentaRequest detalleRequest : ventaRequest.getDetalles()) {
            Producto producto = productoRepository.findByCodigo(detalleRequest.getCodigoProducto())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + detalleRequest.getCodigoProducto()));

            if (producto.getCantidad() < detalleRequest.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para " + producto.getNombre() +
                        ". Stock actual: " + producto.getCantidad());
            }

            // Actualizar stock
            producto.setCantidad(producto.getCantidad() - detalleRequest.getCantidad());
            productoRepository.save(producto);

            // Crear detalle
            DetalleVenta detalle = new DetalleVenta(
                    producto.getCodigo(),
                    producto.getNombre(),
                    detalleRequest.getCantidad(),
                    producto.getPrecio()
            );
            detalles.add(detalle);
            venta.agregarDetalle(detalle);
        }

        // Guardar venta
        Venta ventaGuardada = ventaService.guardarVenta(venta);

        // Crear respuesta
        return convertirAVentaResponse(ventaGuardada);
    }

    private VentaResponse convertirAVentaResponse(Venta venta) {
        VentaResponse response = new VentaResponse();
        response.setId(venta.getId());
        response.setFechaVenta(venta.getFechaVenta());
        response.setTotalVenta(venta.getTotalVenta());

        List<VentaResponse.DetalleVentaResponse> detallesResponse = new ArrayList<>();
        for (DetalleVenta detalle : venta.getDetalles()) {
            VentaResponse.DetalleVentaResponse detalleResponse = new VentaResponse.DetalleVentaResponse();
            detalleResponse.setCodigoProducto(detalle.getCodigoProducto());
            detalleResponse.setNombreProducto(detalle.getNombreProducto());
            detalleResponse.setCantidad(detalle.getCantidad());
            detalleResponse.setPrecioUnitario(detalle.getPrecioUnitario());
            detalleResponse.setSubtotal(detalle.getSubtotal());
            detallesResponse.add(detalleResponse);
        }

        response.setDetalles(detallesResponse);
        return response;
    }
}