const API_URL = 'http://localhost:8080/api/productos';
const API_VENTAS_URL = 'http://localhost:8080/api/ventas';

// Variables globales
let productosVenta = [];
let todosLosProductos = [];
let scannerActive = false;
let currentTargetField = '';
let ultimoTiempoEscaneo = 0;
let debounceTimer;
let ventaDia = 0;
let ultimaFecha = new Date().toDateString();

// ========== INICIALIZACIÓN ==========

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Finca El Criollito iniciado');
    
    // Inicializar fecha y hora
    actualizarFechaHora();
    setInterval(actualizarFechaHora, 1000);
    
    // Verificar cambio de día cada minuto
    setInterval(verificarCambioDeDia, 60000);
    
    // Cargar datos iniciales
    cargarProductos();
    cargarProductosVenta();
    
    // Configurar event listeners
    configurarEventListeners();
    
    // Configurar pistola USB
    configurarPistolaUSB();
    
    // Hacer tablas responsivas
    hacerTablasResponsivas();
});

function configurarEventListeners() {
    // Formularios
    document.getElementById('productoForm').addEventListener('submit', guardarProducto);
    
    // Configurar búsqueda por nombre
    document.getElementById('buscarProducto').addEventListener('input', function(e) {
        if (e.target.value.length >= 3) {
            filtrarProductos(e.target.value);
        } else if (e.target.value.length === 0) {
            cargarProductosVenta();
        }
    });
    
    // Configurar Enter en código de venta
    document.getElementById('codigoVenta').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            buscarPorCodigo();
        }
    });
    
    // Configurar cambio de pestañas con focus automático
    document.getElementById('venta-tab').addEventListener('click', function() {
        setTimeout(() => {
            document.getElementById('codigoVenta').focus();
            cargarProductosVenta();
        }, 100);
    });
    
    document.getElementById('productos-tab').addEventListener('click', function() {
        setTimeout(() => document.getElementById('codigo').focus(), 100);
    });
    
    document.getElementById('historial-tab').addEventListener('click', cargarHistorialVentas);
    
    // Event listener para eliminar productos (event delegation)
    document.getElementById('panel-productos-agregados').addEventListener('click', function(e) {
        if (e.target.closest('.btn-eliminar-producto')) {
            const btn = e.target.closest('.btn-eliminar-producto');
            const index = parseInt(btn.getAttribute('data-index'));
            eliminarProductoAgregado(index);
        }
        
        // Event listener para botones + y -
        if (e.target.closest('.btn-mas') || e.target.closest('.btn-menos')) {
            const btn = e.target.closest('.btn-mas, .btn-menos');
            const index = parseInt(btn.getAttribute('data-index'));
            const esIncremento = btn.classList.contains('btn-mas');
            
            cambiarCantidadProducto(index, esIncremento);
        }
    });
    
    // Event listener para cambios en inputs de cantidad
    document.getElementById('panel-productos-agregados').addEventListener('input', function(e) {
        if (e.target.classList.contains('input-cantidad-producto')) {
            const input = e.target;
            const index = parseInt(input.getAttribute('data-index'));
            const nuevaCantidad = parseInt(input.value);
            
            if (!isNaN(nuevaCantidad) && nuevaCantidad >= 1) {
                actualizarCantidadProducto(index, nuevaCantidad);
            }
        }
    });
    
    // Event listeners para responsividad
    window.addEventListener('resize', hacerTablasResponsivas);
}

function actualizarFechaHora() {
    const ahora = new Date();
    const opciones = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    document.getElementById('fecha-hora').textContent = 
        ahora.toLocaleDateString('es-ES', opciones);
}

// ========== VERIFICACIÓN DE CAMBIO DE DÍA ==========

function verificarCambioDeDia() {
    const fechaActual = new Date().toDateString();
    
    if (fechaActual !== ultimaFecha) {
        ventaDia = 0;
        ultimaFecha = fechaActual;
        actualizarContadorVentaDia();
        console.log('🔄 Venta del día reiniciada - Nuevo día:', fechaActual);
        mostrarNotificacionCambioDia();
    }
}

function mostrarNotificacionCambioDia() {
    const fechaHoy = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    mostrarMensaje(`¡Nuevo día iniciado! ${fechaHoy}\nLa venta del día se ha reiniciado a $0.00`, 'info');
}

// ========== FUNCIONALIDADES RESPONSIVAS ==========

function hacerTablasResponsivas() {
    if (window.innerWidth <= 768) {
        const tablas = document.querySelectorAll('.table');
        tablas.forEach(tabla => {
            const encabezados = [];
            tabla.querySelectorAll('thead th').forEach(th => {
                encabezados.push(th.textContent);
            });
            
            tabla.querySelectorAll('tbody tr').forEach(tr => {
                tr.querySelectorAll('td').forEach((td, index) => {
                    if (index < encabezados.length) {
                        td.setAttribute('data-label', encabezados[index]);
                    }
                });
            });
        });
    }
}

// ========== GESTIÓN DE PRODUCTOS ==========

async function cargarProductos() {
    try {
        mostrarLoadingProductos();
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const productos = await response.json();
        mostrarProductos(productos);
    } catch (error) {
        console.error('Error al cargar productos:', error);
        mostrarErrorProductos(error.message);
    }
}

function mostrarLoadingProductos() {
    const tabla = document.getElementById('tablaProductos');
    tabla.innerHTML = `
        <tr>
            <td colspan="6" class="text-center text-muted py-4">
                <i class="fas fa-spinner fa-spin me-2"></i>Cargando productos...
            </td>
        </tr>
    `;
}

function mostrarErrorProductos(mensaje) {
    const tabla = document.getElementById('tablaProductos');
    tabla.innerHTML = `
        <tr>
            <td colspan="6" class="text-center text-danger py-4">
                <i class="fas fa-exclamation-triangle me-2"></i>Error al cargar productos
                <br><small>${mensaje}</small>
            </td>
        </tr>
    `;
}

function mostrarProductos(productos) {
    const tabla = document.getElementById('tablaProductos');
    
    if (!productos || productos.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="fas fa-box-open me-2"></i>No hay productos registrados
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = '';

    productos.forEach(producto => {
        const fila = document.createElement('tr');
        fila.className = `fade-in ${getClaseStock(producto.cantidad)}`;
        
        fila.innerHTML = `
            <td data-label="ID">${producto.id}</td>
            <td data-label="Código"><strong>${producto.codigo}</strong></td>
            <td data-label="Nombre">${producto.nombre}</td>
            <td data-label="Precio">$${producto.precio.toFixed(2)}</td>
            <td data-label="Stock">
                <span class="badge ${getBadgeStock(producto.cantidad)}">
                    ${producto.cantidad} unidades
                </span>
            </td>
            <td data-label="Acciones">
                <button class="btn btn-warning btn-sm me-1" onclick="editarProducto(${producto.id})" 
                        title="Editar producto">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${producto.id})" 
                        title="Eliminar producto">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tabla.appendChild(fila);
    });
    
    setTimeout(hacerTablasResponsivas, 100);
}

function getClaseStock(cantidad) {
    if (cantidad === 0) return 'table-danger';
    if (cantidad < 10) return 'table-warning';
    return '';
}

function getBadgeStock(cantidad) {
    if (cantidad === 0) return 'bg-danger';
    if (cantidad < 10) return 'bg-warning';
    return 'bg-success';
}

async function guardarProducto(event) {
    event.preventDefault();
    
    const producto = {
        codigo: document.getElementById('codigo').value.trim(),
        nombre: document.getElementById('nombre').value.trim(),
        precio: parseFloat(document.getElementById('precio').value),
        cantidad: parseInt(document.getElementById('cantidad').value)
    };

    if (!producto.codigo || !producto.nombre) {
        mostrarMensaje('El código y nombre son obligatorios', 'error');
        return;
    }

    if (isNaN(producto.precio) || producto.precio < 0 || 
        isNaN(producto.cantidad) || producto.cantidad < 0) {
        mostrarMensaje('El precio y cantidad deben ser valores positivos', 'error');
        return;
    }

    const id = document.getElementById('productoId').value;

    try {
        let response;
        if (id) {
            response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(producto)
            });
        } else {
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(producto)
            });
        }

        if (response.ok) {
            const productoGuardado = await response.json();
            limpiarFormulario();
            
            // Solo cargar productos una vez después de guardar
            await cargarProductos();
            
            // Si estamos en la pestaña de venta, también actualizar productos para venta
            const ventaTab = document.getElementById('venta-tab');
            if (ventaTab.classList.contains('active')) {
                await cargarProductosVenta();
            }
            
            document.getElementById('codigo').focus();
            
            // Mostrar mensaje de éxito
            mostrarMensaje(`Producto "${producto.nombre}" guardado correctamente`, 'success');
        } else {
            const error = await response.text();
            throw new Error(error);
        }
    } catch (error) {
        mostrarMensaje('Error al guardar producto: ' + error.message, 'error');
    }
}

async function editarProducto(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (response.ok) {
            const producto = await response.json();
            document.getElementById('productoId').value = producto.id;
            document.getElementById('codigo').value = producto.codigo;
            document.getElementById('nombre').value = producto.nombre;
            document.getElementById('precio').value = producto.precio;
            document.getElementById('cantidad').value = producto.cantidad;
            
            document.getElementById('productos-tab').click();
            document.getElementById('codigo').focus();
        }
    } catch (error) {
        mostrarMensaje('Error al cargar producto: ' + error.message, 'error');
    }
}

async function eliminarProducto(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) {
            // Solo cargar productos una vez después de eliminar
            await cargarProductos();
            
            // Si estamos en la pestaña de venta, también actualizar productos para venta
            const ventaTab = document.getElementById('venta-tab');
            if (ventaTab.classList.contains('active')) {
                await cargarProductosVenta();
            }
        } else {
            throw new Error('Error al eliminar producto');
        }
    } catch (error) {
        mostrarMensaje('Error al eliminar producto: ' + error.message, 'error');
    }
}

function limpiarFormulario() {
    document.getElementById('productoForm').reset();
    document.getElementById('productoId').value = '';
    document.getElementById('codigo').focus();
}

// ========== VENTA ==========

async function cargarProductosVenta() {
    try {
        mostrarLoadingProductosVenta();
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        todosLosProductos = await response.json();
        const productosConStock = todosLosProductos.filter(producto => producto.cantidad > 0);
        mostrarProductosVenta(productosConStock);
    } catch (error) {
        console.error('Error al cargar productos para venta:', error);
        mostrarErrorProductosVenta(error.message);
    }
}

function mostrarLoadingProductosVenta() {
    const tablaBody = document.getElementById('tabla-productos-venta-body');
    const contador = document.getElementById('contador-productos-disponibles');
    const btnExpandir = document.getElementById('btn-expandir-tabla');
    
    tablaBody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center text-muted py-4">
                <i class="fas fa-spinner fa-spin me-2"></i>Cargando productos...
            </td>
        </tr>
    `;
    contador.textContent = 'Cargando...';
    btnExpandir.style.display = 'none';
}

function mostrarProductosVenta(productos) {
    const tablaBody = document.getElementById('tabla-productos-venta-body');
    const contador = document.getElementById('contador-productos-disponibles');
    const btnExpandir = document.getElementById('btn-expandir-tabla');
    
    if (!productos || productos.length === 0) {
        tablaBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="fas fa-box-open me-2"></i>No hay productos disponibles con stock
                </td>
            </tr>
        `;
        contador.textContent = '0 productos disponibles';
        btnExpandir.style.display = 'none';
        return;
    }

    contador.textContent = `${productos.length} productos disponibles`;
    
    // Mostrar botón solo si hay más de 3 productos (cambiado de 4 a 3)
    if (productos.length > 3) {
        btnExpandir.style.display = 'block';
        btnExpandir.innerHTML = '<i class="fas fa-chevron-down me-1"></i>Ver todos';
        btnExpandir.onclick = toggleTablaProductos;
    } else {
        btnExpandir.style.display = 'none';
    }

    tablaBody.innerHTML = '';

    productos.forEach((producto, index) => {
        const fila = document.createElement('tr');
        fila.className = `fade-in ${getClaseStock(producto.cantidad)}`;
        
        fila.innerHTML = `
            <td data-label="Código"><strong>${producto.codigo}</strong></td>
            <td data-label="Nombre">${producto.nombre}</td>
            <td data-label="Precio">$${producto.precio.toFixed(2)}</td>
            <td data-label="Stock">
                <span class="badge ${getBadgeStock(producto.cantidad)}">
                    ${producto.cantidad} unidades
                </span>
            </td>
            <td data-label="Cantidad">
                <input type="number" class="form-control form-control-sm cantidad-producto" 
                       id="cantidad-${producto.id}" 
                       min="1" max="${producto.cantidad}" 
                       value="1" 
                       data-producto-id="${producto.id}"
                       style="width: 80px;">
            </td>
            <td data-label="Acciones">
                <button class="btn btn-success btn-sm" onclick="seleccionarProducto(${producto.id})" 
                        title="Seleccionar producto">
                    <i class="fas fa-cart-plus"></i> Agregar
                </button>
            </td>
        `;
        tablaBody.appendChild(fila);
    });
    
    setTimeout(hacerTablasResponsivas, 100);
}

function toggleTablaProductos() {
    const container = document.getElementById('tabla-productos-container');
    const btnExpandir = document.getElementById('btn-expandir-tabla');
    
    if (container.style.maxHeight === '300px' || !container.style.maxHeight) {
        // Expandir - mostrar todos los productos
        container.style.maxHeight = 'none';
        btnExpandir.innerHTML = '<i class="fas fa-chevron-up me-1"></i>Contraer';
    } else {
        // Contraer - mostrar solo 3 productos
        container.style.maxHeight = '300px';
        btnExpandir.innerHTML = '<i class="fas fa-chevron-down me-1"></i>Ver todos';
    }
}

function filtrarProductos(terminoBusqueda) {
    const productosFiltrados = todosLosProductos.filter(producto => 
        producto.cantidad > 0 && (
            producto.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
            producto.codigo.toLowerCase().includes(terminoBusqueda.toLowerCase())
        )
    );
    
    mostrarProductosVenta(productosFiltrados);
    
    // Resetear scroll y contraer tabla al buscar
    if (productosFiltrados.length > 0) {
        const container = document.getElementById('tabla-productos-container');
        container.scrollTop = 0;
        container.style.maxHeight = '300px'; // Cambiado de 400px a 300px
        
        const btnExpandir = document.getElementById('btn-expandir-tabla');
        if (btnExpandir && productosFiltrados.length > 3) { // Cambiado de 4 a 3
            btnExpandir.innerHTML = '<i class="fas fa-chevron-down me-1"></i>Ver todos';
        }
    }
}

async function buscarPorCodigo() {
    const codigoInput = document.getElementById('codigoVenta');
    const codigo = codigoInput.value.trim();
    
    if (!codigo) {
        mostrarMensaje('Por favor ingrese un código de producto', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/codigo/${codigo}`);
        if (!response.ok) {
            throw new Error('Producto no encontrado');
        }
        
        const producto = await response.json();
        
        if (producto.cantidad === 0) {
            mostrarMensaje('El producto no tiene stock disponible', 'error');
            return;
        }
        
        seleccionarProducto(producto.id);
        codigoInput.value = '';
        
    } catch (error) {
        mostrarMensaje('Error: ' + error.message, 'error');
    }
}

function seleccionarProducto(productoId) {
    const cantidadInput = document.getElementById(`cantidad-${productoId}`);
    const cantidad = parseInt(cantidadInput.value);
    
    if (isNaN(cantidad) || cantidad < 1) {
        mostrarMensaje('Por favor ingrese una cantidad válida', 'error');
        return;
    }
    
    const producto = todosLosProductos.find(p => p.id === productoId);
    
    if (!producto) {
        mostrarMensaje('Producto no encontrado', 'error');
        return;
    }
    
    // Verificar stock total disponible
    const productoExistente = productosVenta.find(p => p.id === productoId);
    const cantidadTotal = productoExistente ? productoExistente.cantidadVenta + cantidad : cantidad;
    
    if (cantidadTotal > producto.cantidad) {
        const disponible = producto.cantidad - (productoExistente ? productoExistente.cantidadVenta : 0);
        mostrarMensaje(`Stock insuficiente. Máximo disponible: ${disponible}`, 'error');
        return;
    }
    
    if (productoExistente) {
        // Si ya existe, sumar la cantidad
        productoExistente.cantidadVenta += cantidad;
    } else {
        // Si no existe, agregar nuevo producto
        productosVenta.push({
            id: producto.id,
            codigo: producto.codigo,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidadVenta: cantidad,
            stock: producto.cantidad
        });
    }
    
    actualizarPanelProductosAgregados();
    cantidadInput.value = '1';
}

function actualizarPanelProductosAgregados() {
    const panel = document.getElementById('panel-productos-agregados');
    const contador = document.getElementById('contador-productos');
    const totalVenta = document.getElementById('total-venta');
    const cantidadTotal = document.getElementById('cantidad-total');
    
    if (productosVenta.length === 0) {
        panel.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-shopping-cart fa-2x mb-3"></i>
                <p>No hay productos agregados</p>
            </div>
        `;
        contador.textContent = '0';
        totalVenta.textContent = '$0.00';
        cantidadTotal.textContent = '0';
        return;
    }
    
    let html = '';
    let total = 0;
    let cantidadTotalProductos = 0;
    
    productosVenta.forEach((producto, index) => {
        const subtotal = producto.precio * producto.cantidadVenta;
        total += subtotal;
        cantidadTotalProductos += producto.cantidadVenta;
        
        html += `
            <div class="producto-agregado mb-3 p-3 border rounded" data-producto-index="${index}">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${producto.nombre}</h6>
                        <small class="text-muted">Código: ${producto.codigo}</small>
                    </div>
                    <button class="btn btn-outline-danger btn-sm ms-2 btn-eliminar-producto" data-index="${index}" title="Eliminar todo">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="row align-items-center">
                    <div class="col-4">
                        <small>Precio: $${producto.precio.toFixed(2)}</small>
                    </div>
                    <div class="col-8">
                        <div class="d-flex align-items-center justify-content-end">
                            <small class="me-2">Cantidad:</small>
                            <div class="input-group input-group-sm" style="width: 120px;">
                                <button class="btn btn-outline-secondary btn-menos" type="button" data-index="${index}" title="Reducir una unidad">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <input type="number" class="form-control text-center input-cantidad-producto" 
                                       value="${producto.cantidadVenta}" 
                                       min="1" max="${producto.stock}"
                                       data-index="${index}"
                                       style="border-left: 0; border-right: 0;">
                                <button class="btn btn-outline-secondary btn-mas" type="button" data-index="${index}" title="Aumentar una unidad">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-2 text-end">
                    <strong class="text-success">Subtotal: $${subtotal.toFixed(2)}</strong>
                </div>
            </div>
        `;
    });
    
    panel.innerHTML = html;
    contador.textContent = productosVenta.length;
    totalVenta.textContent = `$${total.toFixed(2)}`;
    cantidadTotal.textContent = cantidadTotalProductos;
}

// Función para cambiar cantidad con botones + y -
function cambiarCantidadProducto(index, esIncremento) {
    if (index >= 0 && index < productosVenta.length) {
        const producto = productosVenta[index];
        let nuevaCantidad = producto.cantidadVenta;
        
        if (esIncremento) {
            nuevaCantidad += 1;
        } else {
            nuevaCantidad -= 1;
        }
        
        // Validar que la nueva cantidad esté dentro de los límites
        if (nuevaCantidad < 1) {
            nuevaCantidad = 1;
        }
        
        if (nuevaCantidad > producto.stock) {
            mostrarMensaje(`Stock insuficiente. Máximo disponible: ${producto.stock}`, 'error');
            return;
        }
        
        // Actualizar la cantidad
        producto.cantidadVenta = nuevaCantidad;
        actualizarPanelProductosAgregados();
    }
}

// Función para actualizar cantidad desde input
function actualizarCantidadProducto(index, nuevaCantidad) {
    if (index >= 0 && index < productosVenta.length) {
        const producto = productosVenta[index];
        
        // Validar stock
        if (nuevaCantidad > producto.stock) {
            mostrarMensaje(`Stock insuficiente. Máximo disponible: ${producto.stock}`, 'error');
            // Restaurar valor anterior
            producto.cantidadVenta = producto.cantidadVenta;
            actualizarPanelProductosAgregados();
            return;
        }
        
        // Validar mínimo
        if (nuevaCantidad < 1) {
            nuevaCantidad = 1;
        }
        
        // Actualizar la cantidad
        producto.cantidadVenta = nuevaCantidad;
        actualizarPanelProductosAgregados();
    }
}

function eliminarProductoAgregado(index) {
    if (index >= 0 && index < productosVenta.length) {
        // Eliminar el producto completamente
        productosVenta.splice(index, 1);
        actualizarPanelProductosAgregados();
    }
}

function limpiarProductosAgregados() {
    if (productosVenta.length === 0) return;
    productosVenta = [];
    actualizarPanelProductosAgregados();
}

async function procesarVenta() {
    if (productosVenta.length === 0) {
        mostrarMensaje('No hay productos seleccionados para la venta', 'error');
        return;
    }
    
    const errores = [];
    
    for (const producto of productosVenta) {
        try {
            const response = await fetch(`${API_URL}/codigo/${producto.codigo}`);
            if (response.ok) {
                const productoActual = await response.json();
                if (productoActual.cantidad < producto.cantidadVenta) {
                    errores.push(`${producto.nombre}: Stock insuficiente (${productoActual.cantidad} disponible, ${producto.cantidadVenta} solicitado)`);
                }
            } else {
                errores.push(`${producto.nombre}: Producto no encontrado`);
            }
        } catch (error) {
            errores.push(`${producto.nombre}: Error al verificar stock`);
        }
    }
    
    if (errores.length > 0) {
        mostrarMensaje('Errores de stock:\n' + errores.join('\n'), 'error');
        return;
    }
    
    const ventaRequest = {
        detalles: productosVenta.map(producto => ({
            codigoProducto: producto.codigo,
            cantidad: producto.cantidadVenta
        }))
    };
    
    try {
        const response = await fetch(`${API_URL}/venta-multiple`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(ventaRequest)
        });

        if (response.ok) {
            const ventaResponse = await response.json();
            
            const totalVenta = ventaResponse.totalVenta;
            ventaDia += totalVenta;
            actualizarContadorVentaDia();
            
            productosVenta = [];
            actualizarPanelProductosAgregados();
            
            // Solo cargar productos una vez después de procesar venta
            await cargarProductos();
            await cargarProductosVenta();
            await cargarHistorialVentas();
            
            mostrarTicketVenta(ventaResponse);
            
        } else {
            const error = await response.text();
            throw new Error(error || `Error HTTP: ${response.status}`);
        }
    } catch (error) {
        mostrarMensaje('Error al procesar venta: ' + error.message, 'error');
    }
}

// ========== HISTORIAL DE VENTAS ==========

async function cargarHistorialVentas() {
    try {
        const response = await fetch(API_VENTAS_URL);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const ventas = await response.json();
        mostrarHistorialVentas(ventas);
        calcularEstadisticas(ventas);
        
    } catch (error) {
        console.error('Error al cargar historial:', error);
        mostrarErrorHistorial(error.message);
    }
}

function mostrarErrorHistorial(mensaje) {
    const tabla = document.getElementById('tablaHistorialVentas');
    tabla.innerHTML = `
        <tr>
            <td colspan="4" class="text-center text-danger py-4">
                <i class="fas fa-exclamation-triangle me-2"></i>Error al cargar historial
                <br><small>${mensaje}</small>
            </td>
        </tr>
    `;
}

function mostrarHistorialVentas(ventas) {
    const tabla = document.getElementById('tablaHistorialVentas');
    
    if (!ventas || ventas.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    <i class="fas fa-receipt me-2"></i>No hay ventas registradas
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = '';

    ventas.forEach(venta => {
        const fila = document.createElement('tr');
        fila.className = 'fade-in';
        
        const fecha = new Date(venta.fechaVenta);
        const fechaFormateada = fecha.toLocaleString('es-ES');
        
        const productos = venta.detalles ? 
            venta.detalles.map(d => `${d.nombreProducto} (x${d.cantidad})`).join(', ') : 
            'Productos no disponibles';
        
        fila.innerHTML = `
            <td data-label="ID Venta"><strong>#${venta.id}</strong></td>
            <td data-label="Fecha y Hora">${fechaFormateada}</td>
            <td data-label="Total"><span class="badge bg-success">$${venta.totalVenta.toFixed(2)}</span></td>
            <td data-label="Productos"><small class="text-muted">${productos}</small></td>
        `;
        tabla.appendChild(fila);
    });
    
    setTimeout(hacerTablasResponsivas, 100);
}

function calcularEstadisticas(ventas) {
    const hoy = new Date().toDateString();
    const ventasHoy = ventas.filter(venta => new Date(venta.fechaVenta).toDateString() === hoy);
    ventaDia = ventasHoy.reduce((sum, venta) => sum + venta.totalVenta, 0);
    actualizarContadorVentaDia();
}

// ========== GESTIÓN DE VENTA DEL DÍA ==========

function actualizarContadorVentaDia() {
    document.getElementById('ventaDia').textContent = `$${ventaDia.toFixed(2)}`;
}

async function generarReporte() {
    try {
        const response = await fetch(API_VENTAS_URL);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const todasLasVentas = await response.json();
        
        const hoy = new Date().toDateString();
        const ventasDelDia = todasLasVentas.filter(venta => 
            new Date(venta.fechaVenta).toDateString() === hoy
        );

        generarReporteHTML(ventasDelDia);
        
    } catch (error) {
        console.error('Error al generar reporte:', error);
        mostrarMensaje('Error al generar reporte: ' + error.message, 'error');
    }
}

function generarReporteHTML(ventasDelDia) {
    const ventana = window.open('', '_blank');
    const fechaHoy = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    let productosAgrupados = {};
    let totalProductosVendidos = 0;
    let montoTotalVentas = 0;

    ventasDelDia.forEach(venta => {
        montoTotalVentas += venta.totalVenta;
        
        if (venta.detalles && venta.detalles.length > 0) {
            venta.detalles.forEach(detalle => {
                const nombreProducto = detalle.nombreProducto || 'Producto sin nombre';
                const cantidad = detalle.cantidad || 1;
                const precioUnitario = detalle.precioUnitario || 0;
                const subtotal = cantidad * precioUnitario;

                if (productosAgrupados[nombreProducto]) {
                    productosAgrupados[nombreProducto].cantidad += cantidad;
                    productosAgrupados[nombreProducto].subtotal += subtotal;
                } else {
                    productosAgrupados[nombreProducto] = {
                        cantidad: cantidad,
                        precioUnitario: precioUnitario,
                        subtotal: subtotal
                    };
                }
                
                totalProductosVendidos += cantidad;
            });
        }
    });

    let productosHTML = '';
    
    const productosOrdenados = Object.entries(productosAgrupados)
        .sort(([,a], [,b]) => b.cantidad - a.cantidad);

    productosOrdenados.forEach(([nombreProducto, producto]) => {
        productosHTML += `
            <tr>
                <td>${nombreProducto}</td>
                <td class="text-center">${producto.cantidad}</td>
                <td class="text-center">$${producto.precioUnitario.toFixed(2)}</td>
                <td class="text-center">$${producto.subtotal.toFixed(2)}</td>
            </tr>
        `;
    });

    if (productosOrdenados.length === 0) {
        productosHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    <i class="fas fa-box-open me-2"></i>
                    No hay productos vendidos en el día de hoy
                </td>
            </tr>
        `;
    }

    ventana.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reporte de Ventas del Día - Finca El Criollito</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
            <style>
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    margin: 25px;
                    font-size: 14px;
                    background: #f8f9fa;
                    color: #333;
                }
                .container {
                    max-width: 900px;
                    margin: 0 auto;
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #5a8c5a;
                }
                .header h1 {
                    color: #2c3e50;
                    margin: 0;
                    font-size: 28px;
                }
                .header .subtitle {
                    color: #7ba87b;
                    font-size: 16px;
                    margin-top: 5px;
                }
                .info-dia {
                    background: linear-gradient(135deg, #e3f2fd, #bbdefb);
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                    border-left: 5px solid #2196f3;
                }
                .resumen-ventas {
                    background: linear-gradient(135deg, #e8f5e8, #d4edd4);
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                    border: 2px solid #7ba87b;
                }
                .total-general {
                    background: linear-gradient(135deg, #fff3cd, #ffeaa7);
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                    border: 2px solid #ffc107;
                    text-align: center;
                }
                .tabla-container {
                    margin: 30px 0;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                }
                th {
                    background: linear-gradient(135deg, #5a8c5a, #7ba87b);
                    color: white;
                    padding: 15px;
                    text-align: left;
                    font-weight: 600;
                    font-size: 0.9rem;
                }
                td {
                    padding: 12px 15px;
                    border-bottom: 1px solid #e8f5e8;
                }
                tbody tr:hover {
                    background-color: #f8fbf8;
                }
                .text-center { text-align: center; }
                .text-end { text-align: right; }
                .text-success { color: #28a745; }
                .text-muted { color: #6c757d; }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    color: #666;
                    font-size: 0.85rem;
                    padding-top: 20px;
                    border-top: 1px solid #dee2e6;
                }
                .no-data {
                    text-align: center;
                    padding: 40px;
                    color: #6c757d;
                }
                .no-data i {
                    font-size: 3rem;
                    margin-bottom: 15px;
                    opacity: 0.5;
                }
                @media print {
                    body { 
                        margin: 0;
                        background: white;
                    }
                    .container {
                        box-shadow: none;
                        padding: 15px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1><i class="fas fa-chart-bar me-2"></i>REPORTE DE VENTAS DEL DÍA</h1>
                    <div class="subtitle">Resumen de productos vendidos</div>
                </div>
                
                <div class="info-dia">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <strong><i class="fas fa-calendar me-2"></i>Fecha del reporte:</strong><br>
                            ${fechaHoy}
                        </div>
                        <div>
                            <strong><i class="fas fa-clock me-2"></i>Generado el:</strong><br>
                            ${new Date().toLocaleString('es-ES')}
                        </div>
                    </div>
                </div>

                <div class="resumen-ventas">
                    <h3 style="color: #5a8c5a; margin: 0; text-align: center;">
                        <i class="fas fa-chart-pie me-2"></i>Resumen General del Día
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 15px;">
                        <div style="text-align: center;">
                            <div style="font-size: 1.2rem; font-weight: bold; color: #5a8c5a;">${ventasDelDia.length}</div>
                            <div style="font-size: 0.8rem; color: #666;">Transacciones</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 1.2rem; font-weight: bold; color: #5a8c5a;">${productosOrdenados.length}</div>
                            <div style="font-size: 0.8rem; color: #666;">Productos Diferentes</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 1.2rem; font-weight: bold; color: #5a8c5a;">${totalProductosVendidos}</div>
                            <div style="font-size: 0.8rem; color: #666;">Unidades Vendidas</div>
                        </div>
                    </div>
                </div>

                <div class="total-general">
                    <h3 style="color: #856404; margin: 0;">
                        <i class="fas fa-money-bill-wave me-2"></i>TOTAL GENERAL DEL DÍA
                    </h3>
                    <div style="font-size: 2.5rem; font-weight: bold; color: #28a745; margin-top: 10px;">
                        $${montoTotalVentas.toFixed(2)}
                    </div>
                </div>

                <h2 style="color: #5a8c5a; margin-bottom: 20px;">
                    <i class="fas fa-list-ul me-2"></i>DETALLE DE PRODUCTOS VENDIDOS
                </h2>

                <div class="tabla-container">
                    <table>
                        <thead>
                            <tr>
                                <th><i class="fas fa-box me-2"></i>Producto</th>
                                <th width="120" class="text-center"><i class="fas fa-hashtag me-2"></i>Cantidad Vendida</th>
                                <th width="120" class="text-center"><i class="fas fa-tag me-2"></i>Precio Unitario</th>
                                <th width="120" class="text-center"><i class="fas fa-calculator me-2"></i>Total por Producto</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productosHTML}
                        </tbody>
                    </table>
                </div>

                <div class="footer">
                    <p><i class="fas fa-warehouse me-2"></i>Generado automáticamente por <strong>Finca El Criollito</strong></p>
                    <p>${window.location.hostname} • ${new Date().getFullYear()}</p>
                    <p style="margin-top: 10px; font-size: 0.8rem; color: #888;">
                        <i class="fas fa-info-circle me-1"></i>
                        Este reporte se reinicia automáticamente a las 00:00 horas
                    </p>
                </div>
            </div>

            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 1000);
                };
            </script>
        </body>
        </html>
    `);
    ventana.document.close();
}

// ========== UTILIDADES ==========

function mostrarTicketVenta(ventaResponse) {
    let ticketHtml = `
        <div class="text-center">
            <h4 class="text-primary">🎫 Ticket de Venta #${ventaResponse.id}</h4>
            <p><strong>Fecha:</strong> ${new Date(ventaResponse.fechaVenta).toLocaleString('es-ES')}</p>
            <hr>
            <div class="text-start">
    `;
    
    ventaResponse.detalles.forEach(detalle => {
        ticketHtml += `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                <div>
                    <strong>${detalle.nombreProducto}</strong><br>
                    <small class="text-muted">${detalle.cantidad} x $${detalle.precioUnitario.toFixed(2)}</small>
                </div>
                <strong>$${detalle.subtotal.toFixed(2)}</strong>
            </div>
        `;
    });
    
    ticketHtml += `
            </div>
            <hr>
            <h5 class="text-success">Total: $${ventaResponse.totalVenta.toFixed(2)}</h5>
            <p class="text-muted mt-3">¡Gracias por su compra!</p>
        </div>
    `;
    
    const modalMensaje = document.getElementById('modalMensaje');
    const modalTitulo = document.getElementById('modalTitulo');
    
    modalTitulo.textContent = 'Ticket de Venta';
    modalMensaje.innerHTML = ticketHtml;
    
    const modal = new bootstrap.Modal(document.getElementById('mensajeModal'));
    modal.show();
}

function mostrarMensaje(mensaje, tipo) {
    const modalTitulo = document.getElementById('modalTitulo');
    const modalMensaje = document.getElementById('modalMensaje');
    
    modalTitulo.textContent = tipo === 'success' ? 'Éxito' : 'Error';
    modalTitulo.className = tipo === 'success' ? 'text-success' : 'text-danger';
    modalMensaje.textContent = mensaje;
    modalMensaje.className = tipo === 'success' ? 'text-success' : 'text-danger';
    
    const modal = new bootstrap.Modal(document.getElementById('mensajeModal'));
    modal.show();
}

// ========== SCANNER (Pistola USB) ==========

function configurarPistolaUSB() {
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            const activeElement = document.activeElement;
            const isInputField = activeElement.tagName === 'INPUT' && 
                                (activeElement.type === 'text' || activeElement.type === 'number');
            
            if (isInputField) {
                const fieldId = activeElement.id;
                
                if (fieldId === 'codigoVenta') {
                    buscarPorCodigo();
                }
            }
        }
    });
}

function iniciarScanner(targetFieldId) {
    currentTargetField = targetFieldId;
    mostrarMensaje('Para usar pistola USB, simplemente escanee el código en cualquier campo de texto. La venta se procesará automáticamente.', 'info');
}

function simularEscaneo(codigo, campoId) {
    document.getElementById(campoId).value = codigo;
    
    const event = new Event('input', { bubbles: true });
    document.getElementById(campoId).dispatchEvent(event);
    
    mostrarMensaje(`Código ${codigo} escaneado correctamente`, 'success');
}