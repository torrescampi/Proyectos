package tsq.dev.ventastock.controller;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import tsq.dev.ventastock.producto.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/productos")
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;
    @Autowired
    private ProductoService productoService;

    // Este metodo registra un producto nuevo
    @PostMapping
    public ResponseEntity<DTORespuestaProducto> registrarProducto(@RequestBody @Valid DTORegistroProducto dtoRegistroProducto,
                                                                  UriComponentsBuilder uriComponentsBuilder){
        Producto producto = productoRepository.save(new Producto(dtoRegistroProducto));
        DTORespuestaProducto dtoRespuestaProducto=new DTORespuestaProducto(producto.getId(), producto.getCodigo(),
                producto.getNombre(),producto.getPrecio(), producto.getStock());
        URI url = uriComponentsBuilder.path("/productos/{id}").buildAndExpand(producto.getId()).toUri();
        return ResponseEntity.created(url).body(dtoRespuestaProducto);
    }

    // Este metodo obtiene todos los productos
    @GetMapping("/todos")
    public ResponseEntity<List<DTOListadoProducto>> listaTodosLosProducto(){
        List<DTOListadoProducto> productos = productoRepository.findAll().stream()
                .map(DTOListadoProducto::new)
                .toList();
        return ResponseEntity.ok(productos);
    }

    // Este metodo trae los productos con stock>0
    @GetMapping("/con-stock")
    public ResponseEntity<List<DTOListadoProducto>> listaProductosPorStock() {
        List<DTOListadoProducto> productos = productoRepository.findByStockGreaterThan(0)
                .stream()
                .map(DTOListadoProducto::new)
                .toList();
        return ResponseEntity.ok(productos);
    }

    // Este metodo trae los productos con stock = 0
    @GetMapping("/sin-stock")
    public ResponseEntity<List<DTOListadoProducto>> listarProductosSinStock() {
        List<DTOListadoProducto> productos = productoRepository.findByStock(0)
                .stream()
                .map(DTOListadoProducto::new) // Convierte cada entidad a DTO
                .toList();
        return ResponseEntity.ok(productos);
    }

    // Este metodo actualiza todos los datos del producto
    @PutMapping
    @Transactional
    public ResponseEntity actualizarProducto(@RequestBody @Valid DTOActualizarProducto dtoActualizarProducto){
        Producto producto = productoRepository.getReferenceById(dtoActualizarProducto.id());
        producto.actualizarDatos(dtoActualizarProducto);
        return ResponseEntity.ok(new DTOActualizarProducto(producto.getId(), producto.getCodigo(), producto.getNombre(),
                producto.getPrecio(), producto.getStock()));
    }

    // Este metodo actualiza solo el stock de los productos.
    @PutMapping("/actualizarStock")
    @Transactional
    public ResponseEntity actualizarStock(@RequestBody @Valid DTOActualizarStock dtoActualizarStock) {
        Producto producto = productoRepository.getReferenceById(dtoActualizarStock.id());
        producto.setStock(dtoActualizarStock.getStock());  // Solo actualizas el stock
        return ResponseEntity.ok(new DTOActualizarStock(producto.getId(), producto.getStock()));
    }

//    @PutMapping("/actualizarStock/{codigo}")
//    public ResponseEntity<Producto> actualizarStock(@PathVariable String codigo, @RequestBody int stock) {
//        Optional<Producto> productos = productoRepository.findByCodigo(codigo);
//
//        if (productos.isPresent()) {
//            Producto producto = productos.get();
//            producto.setStock(stock);
//            productoRepository.save(producto);
//            return ResponseEntity.ok(producto);
//        } else {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
//        }
//    }

//    @PostMapping
//    public ResponseEntity<Producto> guardarCodigo(@RequestBody Producto producto) {
//        Producto nuevoCodigo = productoService.guardarCodigo(producto);
//        return ResponseEntity.ok(nuevoCodigo);
//    }

    // Este metodo busca Producto por Codigo
//    @GetMapping("/{codigo}")
//    public ResponseEntity<Producto> buscarPorCodigo(@PathVariable String codigo) {
//        Optional<Producto> codigoBarras = productoService.buscarPorCodigo(codigo);
//        return codigoBarras.map(ResponseEntity::ok)
//                .orElse(ResponseEntity.notFound().build());
//    }
    @GetMapping("/{codigo}")
    public ResponseEntity<Producto> buscarProductoPorCodigo(@PathVariable String codigo) {
        // Lógica para buscar el producto en tu base de datos
        Producto producto = productoService.buscarPorCodigo(codigo);
        return ResponseEntity.ok(producto);
    }
}
