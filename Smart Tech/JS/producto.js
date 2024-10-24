let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let productos = []; // Variable global para almacenar productos

async function cargarProductosDesdeJSON() {
    try {
        const response = await fetch('../data/producto.json'); // Ajusta la ruta si es necesario
        if (!response.ok) throw new Error('Error al cargar productos desde el JSON');
        
        productos = await response.json(); // Almacenar productos en la variable global

        // Determinar la página actual
        const isCelularPage = window.location.pathname.includes('celular.html');
        const isAccesorioPage = window.location.pathname.includes('accesorio.html');

        if (isCelularPage) {
            // Mostrar solo los productos de la categoría "Celular"
            filtrarProductosPorCategoria(productos, 'Celular');
        } else if (isAccesorioPage) {
            // Mostrar solo los productos de la categoría "Accesorio"
            filtrarProductosPorCategoria(productos, 'Accesorio');
        } else {
            // Mostrar todos los productos en la página de inicio
            mostrarProductos(productos);
        }
    } catch (error) {
        console.error("Error al cargar productos desde el JSON:", error);
    }
}

function filtrarProductosPorCategoria(productos, categoria) {
    const listaProductos = document.getElementById('lista-accesorios') || document.getElementById('lista-celulares');

    if (listaProductos) {
        // Limpiar lista de productos anterior
        listaProductos.innerHTML = '';

        const productosFiltrados = productos.filter(producto => producto.categoria === categoria);

        productosFiltrados.forEach(producto => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'product-card'; // Asegúrate de que todas las tarjetas usen esta clase

            tarjeta.innerHTML = `
                <img src="${producto.url_imagen}" alt="${producto.nombre}">
                <div class="card-body"> <!-- Mantener la misma estructura -->
                    <h5>${producto.nombre}</h5>
                    <p>${producto.descripcion}</p>
                    <p><strong>Precio: $${producto.precio}</strong></p>
                    <button class="btn" onclick="agregarAlCarrito(${producto.id})">Agregar al Carrito</button>
                    <button class="btn" onclick="verDetalleProducto(${producto.id})">Ver Detalle</button> <!-- Botón de detalle -->
                </div>
            `;

            listaProductos.appendChild(tarjeta);
        });
    } else {
        console.error("El contenedor de productos no se encontró en el DOM.");
    }
}

function mostrarProductos(productos) {
    const listaProductos = document.getElementById('lista-productos') || document.getElementById('lista-celulares') || document.getElementById('lista-accesorios');

    if (!listaProductos) {
        console.error("El contenedor de productos no se encontró en el DOM.");
        return;
    }

    listaProductos.innerHTML = ''; // Limpiar el contenedor

    productos.forEach(producto => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'product-card'; // Clase de tarjeta

        tarjeta.innerHTML = `
            <img src="${producto.url_imagen}" alt="${producto.nombre}">
            <div class="card-body"> <!-- Mantener la misma estructura -->
                <h5>${producto.nombre}</h5>
                <p>${producto.descripcion}</p>
                <p><strong>Precio: $${producto.precio}</strong></p>
                <button class="btn" onclick="agregarAlCarrito(${producto.id})">Agregar al Carrito</button>
                <button class="btn" onclick="verDetalleProducto(${producto.id})">Ver Detalle</button> <!-- Botón de detalle -->
            </div>
        `;

        listaProductos.appendChild(tarjeta);
    });
}

// Llamar a la función para cargar los productos
cargarProductosDesdeJSON();

// Mostrar y ocultar el carrito deslizante
document.getElementById('ver-carrito').addEventListener('click', function() {
    const carritoSlider = document.getElementById('carrito-slider');
    carritoSlider.classList.toggle('active');
});

// Cerrar el carrito deslizante
function cerrarCarrito() {
    document.getElementById('carrito-slider').classList.remove('active');
}

// Función para vaciar el carrito
function vaciarCarrito() {
    carrito = [];
    localStorage.removeItem('carrito');
    actualizarCarrito();
    mostrarMensaje('El carrito ha sido vaciado.', "info");
}

// Agregar producto al carrito
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    
    if (!producto) {
        console.error('Producto no encontrado');
        return;
    }

    const existingProduct = carrito.find(item => item.nombre === producto.nombre);

    if (existingProduct) {
        if (existingProduct.cantidad < producto.stock) {
            existingProduct.cantidad += 1;
            mostrarMensaje(`${producto.nombre} se ha agregado al carrito.`, "success");
        } else {
            mostrarMensaje(`No hay suficiente stock de ${producto.nombre}.`, "error");
        }
    } else {
        carrito.push({ nombre: producto.nombre, precio: producto.precio, imagen: producto.url_imagen, cantidad: 1 });
        mostrarMensaje(`${producto.nombre} se ha agregado al carrito.`, "success");
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarCarrito();
}

// Actualizar carrito visualmente
function actualizarCarrito() {
    const totalProductos = carrito.reduce((acc, producto) => acc + producto.cantidad, 0);
    document.getElementById('carrito-count').innerText = totalProductos;

    const productosCarrito = document.getElementById('productos-carrito');
    productosCarrito.innerHTML = '';
    let total = 0;

    carrito.forEach(producto => {
        const subtotal = producto.precio * producto.cantidad;
        productosCarrito.innerHTML += `
            <div class="carrito-item">
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <div>
                    <p>${producto.nombre}</p>
                    <p>Precio: $${producto.precio}</p>
                    <p>Cantidad: 
                        <button onclick="actualizarCantidad('${producto.nombre}', -1)">-</button>
                        <span>${producto.cantidad}</span>
                        <button onclick="actualizarCantidad('${producto.nombre}', 1)">+</button>
                    </p>
                    <p>Subtotal: $${subtotal}</p>
                </div>
            </div>`;
        total += subtotal;
    });

    document.getElementById('total-carrito').innerText = `Total: $${total}`;
}

// Actualizar cantidad de producto en el carrito
function actualizarCantidad(nombre, cambio) {
    const producto = carrito.find(item => item.nombre === nombre);

    if (producto) {
        const stockProducto = productos.find(p => p.nombre === nombre)?.stock;

        // Verificar si stockProducto no es undefined
        if (stockProducto === undefined) {
            console.error(`Producto no encontrado: ${nombre}`);
            return;
        }

        // Verificar si el cambio de cantidad es válido
        if (producto.cantidad + cambio > stockProducto) {
            mostrarMensaje(`No hay suficiente stock de ${producto.nombre}.`, "error");
        } else {
            producto.cantidad += cambio;

            // Eliminar el producto del carrito si la cantidad es 0
            if (producto.cantidad <= 0) {
                carrito = carrito.filter(item => item.nombre !== nombre);
                mostrarMensaje(`${producto.nombre} ha sido eliminado del carrito.`, "info");
            }

            // Guardar cambios en el localStorage
            localStorage.setItem('carrito', JSON.stringify(carrito));
            actualizarCarrito(); // Actualizar visualmente el carrito
        }
    } else {
        console.error(`Producto no encontrado en el carrito: ${nombre}`);
    }
}

// Función para ver el detalle del producto
function verDetalleProducto(idProducto) {
    const productoSeleccionado = productos.find(producto => producto.id === idProducto);

    if (productoSeleccionado) {
        localStorage.setItem('productoSeleccionado', JSON.stringify(productoSeleccionado));
        window.location.href = '../Pages/producto.html';
    } else {
        console.error('Producto no encontrado.');
    }
}

// Mostrar mensajes de éxito o error
function mostrarMensaje(mensaje, tipo) {
    const mensajeDiv = document.getElementById('mensaje-dinamico');
    mensajeDiv.innerText = mensaje;
    mensajeDiv.className = `mensaje-dinamico ${tipo}`;
    mensajeDiv.style.display = 'block';

    setTimeout(() => {
        mensajeDiv.style.display = 'none';
    }, 3000);
}

// Cerrar los detalles del producto
function cerrarDetalle() {
    document.getElementById('detalle-producto').style.display = 'none';
}
