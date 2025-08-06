package tsq.dev.ventastock.producto;

public record DTOActualizarProducto(
        Long id,
        String codigo,
        String nombre,
        Double precio,
        int stock
) {
}
