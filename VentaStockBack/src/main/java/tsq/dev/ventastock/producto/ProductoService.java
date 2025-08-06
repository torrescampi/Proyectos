package tsq.dev.ventastock.producto;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProductoService {
    @Autowired
    private ProductoRepository productoRepository;

    public Producto guardarCodigo(Producto producto) {
        return productoRepository.save(producto);
    }

    public Producto buscarPorCodigo(String codigo) {
        return (Producto) productoRepository.findByCodigo(codigo);
    }
}
