// admin.js

let productos = []; // Variable global para almacenar productos

async function cargarProductosDesdeJSON() {
    try {
        const response = await fetch('../data/producto.json'); // Ajusta la ruta si es necesario
        if (!response.ok) throw new Error('Error al cargar productos desde el JSON');

        productos = await response.json(); // Almacenar productos en la variable global
    } catch (error) {
        console.error("Error al cargar productos desde el JSON:", error);
    }
}

async function agregarProducto() {
    const nombre = document.getElementById('nombre').value;
    const descripcion = document.getElementById('descripcion').value;
    const marca = document.getElementById('marca').value;
    const precio = parseFloat(document.getElementById('precio').value);
    const stock = parseInt(document.getElementById('stock').value);
    const categoria = document.getElementById('categoria').value;
    const url_imagen = document.getElementById('url-imagen').value;

    const nuevoProducto = {
        id: Date.now(), // Asigna un ID único basado en la fecha actual
        nombre,
        descripcion,
        marca,
        precio,
        stock,
        categoria,
        url_imagen,
    };

    try {
        productos.push(nuevoProducto);
        await guardarProductosEnJSON();
        mostrarMensaje(`Producto ${nombre} añadido exitosamente.`, "success");
    } catch (error) {
        console.error("Error al agregar producto:", error);
    }
}

async function guardarProductosEnJSON() {
    const response = await fetch('../data/producto.json', {
        method: 'PUT', // Asegúrate de que tu backend maneje este método
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productos),
    });

    if (!response.ok) {
        throw new Error('Error al guardar productos en el JSON');
    }
}

// Cargar productos para editar
async function cargarProductosParaEditar() {
    await cargarProductosDesdeJSON();
    const select = document.getElementById('producto-select');

    productos.forEach(producto => {
        const option = document.createElement('option');
        option.value = producto.id;
        option.textContent = producto.nombre;
        select.appendChild(option);
    });
}

// Mostrar información del producto para editar
function mostrarProductoParaEditar() {
    const select = document.getElementById('producto-select');
    const idProducto = select.value;
    const producto = productos.find(p => p.id == idProducto);

    if (producto) {
        document.getElementById('producto-id').value = producto.id;
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('descripcion').value = producto.descripcion;
        document.getElementById('marca').value = producto.marca;
        document.getElementById('precio').value = producto.precio;
        document.getElementById('stock').value = producto.stock;
        document.getElementById('categoria').value = producto.categoria;
        document.getElementById('url-imagen').value = producto.url_imagen;
    }
}

// Lógica para actualizar un producto
async function editarProducto() {
    const id = parseInt(document.getElementById('producto-id').value);
    const nombre = document.getElementById('nombre').value;
    const descripcion = document.getElementById('descripcion').value;
    const marca = document.getElementById('marca').value;
    const precio = parseFloat(document.getElementById('precio').value);
    const stock = parseInt(document.getElementById('stock').value);
    const categoria = document.getElementById('categoria').value;
    const url_imagen = document.getElementById('url-imagen').value;

    const productoActualizado = {
        id,
        nombre,
        descripcion,
        marca,
        precio,
        stock,
        categoria,
        url_imagen,
    };

    try {
        const index = productos.findIndex(p => p.id === id);
        if (index !== -1) {
            productos[index] = productoActualizado;
            await guardarProductosEnJSON();
            mostrarMensaje(`Producto ${nombre} actualizado exitosamente.`, "success");
        } else {
            mostrarMensaje(`Producto con ID ${id} no encontrado.`, "error");
        }
    } catch (error) {
        console.error("Error al editar producto:", error);
    }
}

// Eliminar producto
async function eliminarProducto() {
    const id = parseInt(document.getElementById('producto-select').value);

    try {
        productos = productos.filter(p => p.id !== id);
        await guardarProductosEnJSON();
        mostrarMensaje(`Producto con ID ${id} eliminado exitosamente.`, "success");
    } catch (error) {
        console.error("Error al eliminar producto:", error);
    }
}

// Mensaje dinámico
function mostrarMensaje(mensaje, tipo) {
    const mensajeDiv = document.getElementById('mensaje-dinamico');
    mensajeDiv.innerText = mensaje;
    mensajeDiv.className = `mensaje-dinamico ${tipo}`;
    mensajeDiv.style.display = 'block';

    setTimeout(() => {
        mensajeDiv.style.display = 'none';
    }, 3000);
}

// Llamar a cargar productos al cargar la página
document.addEventListener('DOMContentLoaded', cargarProductosParaEditar);
