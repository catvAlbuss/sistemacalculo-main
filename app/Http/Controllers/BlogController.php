<?php

namespace App\Http\Controllers;

use App\Models\blog;
use Carbon\Carbon;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $blogs = blog::select('id', 'titulo', 'descripcion', 'fecha_publicacion', 'fecha_modificacion', 'ubicacion', 'imagenref')
            ->get();

        return view('blogs.index', compact('blogs'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        return view('blogs.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validar los datos del formulario
        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'fecha_publicacion' => 'required|date',
            'ubicacion' => 'required|string',
            'imagenref' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:2048', // Validación de imagen
        ]);
        // Si hay una imagen, se maneja su carga
        $imagenNombre = null;
        if ($request->hasFile('imagenref')) {
            // Obtener la imagen
            $imagen = $request->file('imagenref');

            // Generar un nombre único basado en el tiempo
            $imagenNombre = Carbon::now()->timestamp . '.' . $imagen->getClientOriginalExtension();

            // Guardar la imagen en la carpeta public/assets/img/blog
            $imagen->move(public_path('assets/img/blog'), $imagenNombre);
        }

        $descripciondetallado = '{
            "type": "doc",
            "content": [
                {
                    "type": "paragraph",
                    "attrs": {
                        "textAlign": "left"
                    }
                },
                {
                    "type": "paragraph",
                    "attrs": {
                        "textAlign": "left"
                    },
                    "content": [
                        {
                            "type": "text",
                            "text": "Escribe tu texto"
                        },
                        {
                            "type": "text",
                            "text": "."
                        }
                    ]
                }
            ]
        }';
        // Crear el blog con los datos validados
        blog::create([
            'titulo' => $validated['titulo'],
            'descripcion' => $validated['descripcion'],
            'fecha_publicacion' => $validated['fecha_publicacion'],
            'fecha_modificacion' => Carbon::now(),
            'ubicacion' => $validated['ubicacion'],
            'imagenref' => $imagenNombre,
            'descripciondetall' => $descripciondetallado,
        ]);
        return redirect()->route('blogs_list')->with('success', 'Blog creado correctamente.');
        //return redirect()->route('blogs.index')->with('success', 'Blog creado correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Blog $blog)
    {
        // Ensure the blog exists
        if (!$blog) {
            abort(404, 'Blog not found');
        }

        // Fetch only the necessary columns
        $blog = Blog::select('id', 'descripciondetall')
            ->where('id', $blog->id)
            ->first();

        // Pass the $blog variable to the view
        return view('blogs.show', compact('blog'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(blog $blog)
    {
        return view('blogs.editar', compact('blog'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Blog $blog)
    {
        // Validar los datos del formulario
        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'ubicacion' => 'required|string',
            'imagenref' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
        ]);

        // Si hay una nueva imagen, se maneja su carga
        if ($request->hasFile('imagenref')) {
            // Eliminar la imagen anterior si existe
            if ($blog->imagenref && file_exists(public_path('assets/img/blog/' . $blog->imagenref))) {
                unlink(public_path('assets/img/blog/' . $blog->imagenref));
            }

            // Obtener la nueva imagen
            $imagen = $request->file('imagenref');
            $imagenNombre = Carbon::now()->timestamp . '.' . $imagen->getClientOriginalExtension();
            $imagen->move(public_path('assets/img/blog'), $imagenNombre);

            // Actualizar el nombre de la imagen en la base de datos
            $blog->imagenref = $imagenNombre;
        }

        // Actualizar los demás campos
        $blog->update([
            'titulo' => $validated['titulo'],
            'descripcion' => $validated['descripcion'],
            'ubicacion' => $validated['ubicacion'],
            'fecha_modificacion' => Carbon::now(),
        ]);

        return redirect()->route('blogs_list')->with('success', 'Blog actualizado correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Blog $blog)
    {
        try {
            // Verificar si el blog tiene una imagen asociada
            if ($blog->imagenref && file_exists(public_path('assets/img/blog/' . $blog->imagenref))) {
                // Eliminar la imagen del servidor
                unlink(public_path('assets/img/blog/' . $blog->imagenref));
            }

            // Eliminar el blog de la base de datos
            $blog->delete();

            // Redirigir con un mensaje de éxito
            return redirect()->route('blogs_list')->with('success', 'Blog eliminado correctamente.');
        } catch (\Exception $e) {
            // Redirigir con un mensaje de error
            return redirect()->route('blogs_list')->with('error', 'No se pudo eliminar el blog.');
        }
    }


    public function ListarBlogs()
    {
        // Obtener solo las columnas necesarias
        $blogs = Blog::select('id', 'titulo', 'descripcion', 'fecha_publicacion', 'fecha_modificacion', 'ubicacion', 'imagenref')->get();

        // Pasar los datos a la vista
        return view('blogs.list', compact('blogs'));
    }

    public function editarbloginter(Blog $blog)
    {
        // Verificar si el blog existe
        if (!$blog) {
            abort(404, 'Blog no encontrado');
        }

        // Recuperar solo la columna 'descripciondetall'
        $blog = Blog::select('id', 'descripciondetall')
            ->where('id', $blog->id)
            ->first();

        // Pasar la variable $blog a la vista
        return view('blogs.createdesblog', compact('blog'));
    }

    public function updateblogdetaill(Request $request, Blog $blog)
    {
        // Validar los datos del formulario
        $validated = $request->validate([
            'descripciondetall' => 'required|json',
        ]);

        try {
            // Actualizar la descripción detallada
            $blog->update([
                'descripciondetall' => $validated['descripciondetall'],
                'fecha_modificacion' => Carbon::now(),
            ]);

            // Devolver una respuesta JSON
            return response()->json([
                'success' => true,
                'message' => 'Descripción actualizada correctamente.',
            ]);
        } catch (\Exception $e) {
            // Devolver una respuesta JSON con el error
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el blog: ' . $e->getMessage(),
            ], 500);
        }
    }
}
