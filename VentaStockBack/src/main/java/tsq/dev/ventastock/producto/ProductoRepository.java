package tsq.dev.ventastock.producto;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByStockGreaterThan(int stock);
    List<Producto> findByStock(int stock);
    List<Producto> findByCodigo(String codigo);
}
