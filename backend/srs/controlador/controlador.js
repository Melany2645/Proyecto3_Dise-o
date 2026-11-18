export class Controlador {
  #servicio;

  constructor(servicio) {
    this.#servicio = servicio;
  }

  crear = async (req, res) => {
    const receta = await this.#servicio.crear(req.body);
    res.status(201).location(`/api/recetas/${receta.id}`).json(receta);
  };

  listar = async (req, res) => {
    const { pagina, nombre, ingrediente } = req.query;
    const resultado = await this.#servicio.listar({
      pagina: pagina === undefined ? undefined : Number(pagina),
      nombre,
      ingrediente,
    });
    res.json(resultado);
  };

  recientes = async (_req, res) => {
    res.json({ datos: await this.#servicio.recientes() });
  };

  obtener = async (req, res) => {
    res.json(await this.#servicio.obtener(req.params.id));
  };

  actualizar = async (req, res) => {
    res.json(await this.#servicio.actualizar(req.params.id, req.body));
  };

  eliminar = async (req, res) => {
    await this.#servicio.eliminar(req.params.id);
    res.status(204).end();
  };
}
