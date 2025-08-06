package tsq.dev.ventastock.producto;

public record DTOActualizarStock(
        Long id,
        int stock
) {
    public int getStock() {
        return this.stock();
    }
    public int setStock(){
        return this.stock();
    }
}

