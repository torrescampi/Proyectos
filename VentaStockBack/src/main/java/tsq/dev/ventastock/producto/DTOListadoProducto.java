package tsq.dev.ventastock.producto;

public record DTOListadoProducto(
        Long id,
        String codigo,
        String nombre,
        Double precio,
        int stock
) {
    public DTOListadoProducto(Producto producto){
        this(producto.getId(), producto.getCodigo(), producto.getNombre(),
                producto.getPrecio(), producto.getStock());
    }
}
