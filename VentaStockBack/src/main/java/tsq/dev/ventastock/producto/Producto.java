package tsq.dev.ventastock.producto;


import jakarta.persistence.*;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Table(name = "productos")
@Entity(name = "Producto")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private String codigo;
    private String nombre;
    private Double precio;
    private int stock;

    public Producto(@Valid DTORegistroProducto dtoRegistroProducto) {
        this.codigo = dtoRegistroProducto.codigo();
        this.nombre = dtoRegistroProducto.nombre();
        this.precio = dtoRegistroProducto.precio();
        this.stock = dtoRegistroProducto.stock();
    }

    public void actualizarDatos(DTOActualizarProducto dtoActualizarProducto){
        if (dtoActualizarProducto.nombre() != null){
            this.nombre= dtoActualizarProducto.nombre();
        }
        if (dtoActualizarProducto.precio() != null){
            this.precio = dtoActualizarProducto.precio();
        }
        if (dtoActualizarProducto.stock() != 0){
            this.stock = dtoActualizarProducto.stock();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Double getPrecio() {
        return precio;
    }

    public void setPrecio(Double precio) {
        this.precio = precio;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public void setCodigo(String codigo) {
        if (!codigo.matches("\\d{12,13}")) { // Validación para EAN-13
            throw new IllegalArgumentException("Código de barras no válido");
        }
        this.codigo = codigo;
    }
}
