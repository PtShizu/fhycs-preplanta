'use client';

import { Tab, Tabs } from 'react-bootstrap';
import Nav from '../Nav';
import Image from 'next/image';

export default function HelpSection() {
  return (
    <main>
        <Nav></Nav>
        <div className="p-4">
        <h2>Manual de usuario</h2>

        <Tabs className="mt-4">
            <Tab title="General" eventKey="general">
  <div className="mt-3">
    <div className="card mb-4 shadow-sm">
      <div className="card-body">
        <h5 className="card-title text-secondary"><i className="bi bi-info-circle me-2"></i>Información General</h5>
        <ul className="mb-3">
          <li>Esta página web está diseñada para coordinadores de programas educativos de la Facultad de Humanidades y Ciencias Sociales de la UABC.</li>
          <li>Permite consultar y modificar información sobre horarios, salones, profesores, grupos y programas educativos.</li>
          <li>Acceso restringido a coordinadores registrados.</li>
          <li>Interfaz intuitiva y navegación por pestañas.</li>
        </ul>
        <div className="alert alert-info">
          <b>Tip:</b> Navega entre las pestañas para acceder a las diferentes funciones del sistema.
        </div>
      </div>
    </div>
  </div>
</Tab>
    <Tab title="Horarios" eventKey="horarios">
  <div className="mt-3">
    <div className="card mb-4 shadow-sm">
      <div className="card-body">
        <h5 className="card-title text-danger"><i className="bi bi-calendar-week me-2"></i>Gestión de Horarios</h5>
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card border-primary mb-2">
              <div className="card-header bg-primary text-white py-1 px-2"><i className="bi bi-pencil-square me-1"></i>Edición básica de horario</div>
              <div className="card-body py-2 px-2">
                <ol className="mb-2">
                  <li>Selecciona el grupo para ver o editar su horario.</li>
                  <li>Haz clic en una celda para agregar.</li>
                  <li>Elige materia, profesor y tipo de clase.</li>
                  <li>Presiona el botón de agregar.</li>
                  <li>Si la clase es virtual, selecciona la celda después de haber agregado la clase, luego con los botones correspondientes indica si es síncrona o asíncrona.</li>
                </ol>
                <div className="alert alert-secondary mb-0 py-1 px-2">
                  <b>Tip:</b> Utiliza el menú contextual (clic derecho) para copiar/cortar clases.
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-secondary mb-2">
              <div className="card-header bg-secondary text-white py-1 px-2"><i className="bi bi-funnel me-1"></i>Opciones de materias y profesores</div>
              <div className="card-body py-2 px-2">
                <ul className="mb-2">
                  <li>Las materias que aparezcan a elegir dependen de qué grupo se esté editando.</li>
                  <ul>
                    <li>Si se tiene marcada la opción &quot;Restringir materias obligatorias al semestre del grupo&quot;, solo se mostrarán las materias obligatorias que correspondan al semestre actual del grupo.</li>
                    <li>Si se marca &quot;Incluir optativas generales&quot;, podrás elegir de cualquier materia optativa sin importar la etapa, de lo contrario, se mostrarán las materias optativas cuyas etapas correspondan a la etapa del grupo, la cuál es asignada en la pestaña de grupos.</li>
                  </ul>
                  <li>Solo puedes seleccionar profesores que estén disponibles en el día y hora seleccionados.</li>
                </ul>
                <div className="alert alert-secondary mb-0 py-1 px-2">
                  <b>Tip:</b> La información de materias, profesores, etc. es tomada directamente de las pestañas correspondientes y se actualiza automáticamente.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row g-3 mt-1">
          <div className="col-md-12">
            <div className="card border-info mb-2">
              <div className="card-header bg-info text-white py-1 px-2"><i className="bi bi-building me-1"></i>Asignación de salón y edificio (subdirector)</div>
              <div className="card-body py-2 px-2">
                <ol className="mb-2">
                  <li>Selecciona la clase a la que quieras asignar un edificio y salón.</li>
                  <li>Selecciona un edificio y salón.</li>
                  <li>Presiona el botón de agregar.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</Tab>
    <Tab title="Salones" eventKey="salones">
  <div className="mt-3">
    <div className="card mb-4 shadow-sm">
      <div className="card-body">
        <h5 className="card-title text-success"><i className="bi bi-door-open me-2"></i>Gestión de Salones</h5>
        <ul className="mb-3">
          <li>Consulta la lista de salones disponibles.</li>
          <li>Agrega, edita o elimina salones según sea necesario.</li>
          <li>Al presionar el botón de ver horario, puedes visualizar en forma de calendario la disponibilidad del salón.</li>
        </ul>
        <div className="alert alert-info">
          <b>Editar salón:</b> Puedes modificar el edificio, número o capacidad del salón. Los cambios se aplican al presionar guardar.
        </div>
        <h6 className="mt-4">Propiedades de un salón:</h6>
        <table className="table table-bordered mt-2">
          <thead className="table-light">
            <tr>
              <th>Propiedad</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>edificio</b></td>
              <td>Nombre o identificador del edificio donde se encuentra el salón.</td>
            </tr>
            <tr>
              <td><b>num</b></td>
              <td>Número o identificador del salón dentro del edificio.</td>
            </tr>
            <tr>
              <td><b>capacidad</b></td>
              <td>Cantidad máxima de personas que pueden ocupar el salón. <u>Este valor solo es para referencia ya que no se usa dentro del sistema.</u></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</Tab>
    <Tab title="Profesores" eventKey="profesores">
  <div className="mt-3">
    <div className="card mb-4 shadow-sm">
      <div className="card-body">
        <h5 className="card-title text-warning"><i className="bi bi-person-badge me-2"></i>Gestión de Profesores</h5>
        <ul className="mb-3">
          <li>Visualiza y administra la información de los profesores.</li>
          <li>Agrega, edita o elimina profesores.</li>
          <li>Consulta la disponibilidad y asignaturas de interés de cada profesor.</li>
          <li>Al presionar el botón de ver horario, puedes visualizar en forma de calendario la disponibilidad del profesor.</li>
          <li>Si no tienes a la mano el PDF de un profesor que quieras registrar, puedes presionar el botón de crear y luego elegir crear vacío, esto crea una entrada vacía en el listado de profesores. <br /><u>Luego entras a editar para llenar la información manualmente</u></li>
        </ul>
        <div className="alert alert-secondary">
          <i className="bi bi-file-earmark-pdf me-2"></i>
          <b>Subir PDF:</b> Al presionar el botón de crear profesor, puedes subir un archivo PDF con la información de disponibilidad y asignaturas de interés del profesor. El sistema extraerá automáticamente estos datos para facilitar el registro y actualización.
        </div>
        <div className="alert alert-info">
          <b>Editar profesor:</b> Al editar un profesor, puedes modificar manualmente todos sus datos, incluyendo disponibilidad, asignaturas de interés, cursos y plataformas. La edición puede ser más compleja que en salones o grupos, ya que implica gestionar listas y horarios, y <u>puedes volver a subir un PDF para actualizar la información de forma masiva,</u> <u>esta acción sobreescribe la información existente.</u>
        </div>
        <h6 className="mt-4">Propiedades de un profesor:</h6>
        <table className="table table-bordered mt-2">
          <thead className="table-light">
            <tr>
              <th>Propiedad</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><b>nombre</b></td><td>Nombre completo del profesor.</td></tr>
            <tr><td><b>número de empleado</b></td><td>Número de empleado asignado por la universidad.</td></tr>
            <tr><td><b>correo</b></td><td>Correo electrónico institucional del profesor.</td></tr>
            <tr><td><b>coordina</b></td><td>Programa educativo que coordina (si aplica).</td></tr>
            <tr><td><b>disponibilidad</b></td><td>Días y horas en que el profesor está disponible para impartir clases.</td></tr>
            <tr><td><b>asignaturas de interés</b></td><td>Materias que el profesor está interesado en impartir.</td></tr>
            <tr><td><b>cursos</b></td><td>Cursos de actualización o capacitación que ha tomado el profesor.</td></tr>
            <tr><td><b>plataformas</b></td><td>Plataformas digitales que utiliza el profesor.</td></tr>
            <tr><td><b>otros programas</b></td><td>Otros programas o actividades en los que participa el profesor.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</Tab>
    <Tab title="Grupos" eventKey="grupos">
  <div className="mt-3">
    <div className="card mb-4 shadow-sm">
      <div className="card-body">
        <h5 className="card-title text-info"><i className="bi bi-people-fill me-2"></i>Gestión de Grupos</h5>
        <ul className="mb-3">
          <li>Consulta y administra los grupos de cada programa educativo.</li>
          <li>Agrega, edita o elimina grupos.</li>
        </ul>
        <div className="alert alert-info">
          <b>Editar grupo:</b> Puedes modificar el número o la etapa del grupo. Los cambios se aplican al presionar guardar.
        </div>
        <h6 className="mt-4">Propiedades de un grupo:</h6>
        <table className="table table-bordered mt-2">
          <thead className="table-light">
            <tr>
              <th>Propiedad</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><b>número</b></td><td>Número del grupo (por ejemplo, 101, 201, etc.).</td></tr>
            <tr><td><b>etapa</b></td><td>Básica, disciplinaria o terminal.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</Tab>
    <Tab title="Programas Educativos" eventKey="programas">
  <div className="mt-3">
    <div className="card mb-4 shadow-sm">
      <div className="card-body">
        <h5 className="card-title text-primary"><i className="bi bi-journal-text me-2"></i>Gestión de Programas Educativos</h5>
        <ul className="mb-3">
          <li>Visualiza los programas educativos disponibles.</li>
          <li>Administra la información de cada programa.</li>
          <li>Al presionar el botón de descargar PDF, se descarga un archivo que indica en formato de tabla para cada grupo, las clases que se le han sido asignadas.</li>
        </ul>
        <div className="alert alert-info">
          <b>Editar programa educativo:</b>
          <ul className="mb-0">
            <li>Puedes modificar manualmente la información general y la estructura de materias.</li>
            <li><u>Si decides subir un PDF, este debe contener la lista completa de materias y su estructura, esta acción sobreescribe la información existente.</u></li>
            <li>Puedes añadir materias al programa que estén registradas en otros programas educativos.</li>
            <li>Si una materia no está registrada, puedes crearla directamente, <u>completando el formulario correspondiente.</u></li>
            <li>Al editar la lista de materias del programa educativo, los cambios no se guardan automáticamente, <u>debes presionar el botón de añadir.</u></li>
            <li>Al editar la información individual de una materia (por ejemplo, etapa, créditos u horas de clase), <u>los cambios se guardan automáticamente.</u></li>
          </ul>
        </div>
        <h6 className="mt-4">Propiedades de un programa educativo:</h6>
        <table className="table table-bordered mt-2">
          <thead className="table-light">
            <tr>
              <th>Propiedad</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>nombre</b></td>
              <td>Nombre oficial del programa educativo.</td>
            </tr>
            <tr>
              <td><b>número de grupo</b></td>
              <td>Número con el que inician los grupos pertenecientes al programa.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</Tab>
    <Tab title="Actualizaciones" eventKey="actualizaciones">
  <div className="mt-3">
    <div className="card mb-4 shadow-sm">
      <div className="card-body">
        <h5 className="card-title text-dark"><i className="bi bi-arrow-repeat me-2"></i>Actualizaciones</h5>
        <ul className="mb-3">
          <li>Consulta las últimas actualizaciones y mejoras del sistema.</li>
        </ul>
        <div className="alert alert-info">
          <b>Tip:</b> Revisa la sección de actualizaciones periódicamente para estar al tanto de nuevas funciones y correcciones.</div>
      </div>
    </div>
  </div>
</Tab>
        </Tabs>
        </div>
    </main>
  );
}