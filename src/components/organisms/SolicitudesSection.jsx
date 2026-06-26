import { useCallback, useState } from 'react'
import useApiResource from '../../hooks/useApiResource'
import {
  createSolicitud,
  deleteSolicitud,
  listSolicitudes,
  updateSolicitud,
} from '../../services/solicitudCompraService'
import '../../styles/organisms/SolicitudesSection.css'

const ESTADOS = ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'EN_PROCESO', 'COMPLETADA']

const HIGH_PRIORITY_THRESHOLD = 500000

const emptyForm = {
  titulo: '',
  descripcion: '',
  categoria: '',
  montoEstimado: 0,
  fechaRequerida: '',
  estado: 'PENDIENTE',
  usuarioSolicitanteId: '',
}

function getContent(data) {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.content)) {
    return data.content
  }

  return []
}

function getSolicitudId(solicitud) {
  return solicitud?.id ?? solicitud?.solicitudId
}

function getErrorMessage(error) {
  if (!error) {
    return ''
  }

  if (Array.isArray(error.errores) && error.errores.length > 0) {
    return error.errores
      .map((item) => {
        if (typeof item === 'string') {
          return item
        }

        return item?.mensaje || item?.message || item?.defaultMessage || JSON.stringify(item)
      })
      .join(' · ')
  }

  if (error.errores && typeof error.errores === 'object') {
    return Object.entries(error.errores)
      .map(([field, message]) => `${field}: ${message}`)
      .join(' · ')
  }

  if (error.status >= 500) {
    return 'Backend no disponible. Verifica que VITE_API_URL apunte a tu backend Spring Boot.'
  }

  if (error.status) {
    return `${error.message || 'No fue posible completar la operación.'} (HTTP ${error.status})`
  }

  return 'Backend no disponible. Verifica que VITE_API_URL apunte a tu backend Spring Boot.'
}

function getTodayIso() {
  return new Date().toISOString().slice(0, 10)
}

function validateForm(form) {
  const errors = {}

  if (!form.titulo.trim()) {
    errors.titulo = 'El título es requerido.'
  }

  if (form.montoEstimado === '' || form.montoEstimado === null || form.montoEstimado === undefined) {
    errors.montoEstimado = 'El monto estimado es requerido.'
  } else if (Number(form.montoEstimado) < 0) {
    errors.montoEstimado = 'El monto estimado no puede ser negativo.'
  }

  if (form.fechaRequerida) {
    const today = getTodayIso()

    if (form.fechaRequerida < today) {
      errors.fechaRequerida = 'La fecha requerida no puede ser anterior a hoy.'
    }
  }

  if (form.usuarioSolicitanteId !== '' && form.usuarioSolicitanteId !== null && form.usuarioSolicitanteId !== undefined) {
    const num = Number(form.usuarioSolicitanteId)

    if (!Number.isInteger(num) || num <= 0) {
      errors.usuarioSolicitanteId = 'El ID del solicitante debe ser un número entero positivo.'
    }
  }

  return errors
}

function buildPayload(form) {
  const payload = {
    titulo: form.titulo.trim(),
    descripcion: form.descripcion.trim(),
    categoria: form.categoria.trim(),
    montoEstimado: Number(form.montoEstimado),
    estado: form.estado,
  }

  if (form.fechaRequerida) {
    payload.fechaRequerida = form.fechaRequerida
  }

  if (form.usuarioSolicitanteId !== '' && form.usuarioSolicitanteId !== null && form.usuarioSolicitanteId !== undefined) {
    payload.usuarioSolicitanteId = Number(form.usuarioSolicitanteId)
  }

  return payload
}

function formatMonto(monto) {
  if (monto === null || monto === undefined) {
    return '-'
  }

  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(monto)
}

function formatDate(dateStr) {
  if (!dateStr) {
    return '-'
  }

  try {
    const d = new Date(dateStr)

    if (Number.isNaN(d.getTime())) {
      return dateStr
    }

    return d.toLocaleDateString('es-CL')
  } catch {
    return dateStr
  }
}

function SolicitudesSection() {
  const requestSolicitudes = useCallback(() => listSolicitudes({ page: 0, size: 20 }), [])
  const { data, loading, error, refetch } = useApiResource(requestSolicitudes)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSolicitud, setEditingSolicitud] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const solicitudes = getContent(data)
  const total = typeof data?.totalElements === 'number' ? data.totalElements : solicitudes.length

  function openCreateModal() {
    setEditingSolicitud(null)
    setForm(emptyForm)
    setFormErrors({})
    setActionError('')
    setActionMessage('')
    setIsModalOpen(true)
  }

  function openEditModal(solicitud) {
    setEditingSolicitud(solicitud)
    setForm({
      titulo: solicitud?.titulo || '',
      descripcion: solicitud?.descripcion || '',
      categoria: solicitud?.categoria || '',
      montoEstimado: solicitud?.montoEstimado ?? 0,
      fechaRequerida: solicitud?.fechaRequerida ? String(solicitud.fechaRequerida).slice(0, 10) : '',
      estado: solicitud?.estado || 'PENDIENTE',
      usuarioSolicitanteId: solicitud?.usuarioSolicitanteId ?? '',
    })
    setFormErrors({})
    setActionError('')
    setActionMessage('')
    setIsModalOpen(true)
  }

  function closeModal(force = false) {
    if (submitting && !force) {
      return
    }

    setIsModalOpen(false)
    setEditingSolicitud(null)
    setForm(emptyForm)
    setFormErrors({})
    setActionError('')
  }

  function handleFieldChange(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }))
  }

  async function handleRefresh() {
    setActionError('')
    setActionMessage('')

    try {
      await refetch()
      setActionMessage('Solicitudes sincronizadas con /api/solicitudes-compra.')
    } catch (requestError) {
      setActionError(getErrorMessage(requestError))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validateForm(form)
    setFormErrors(validationErrors)
    setActionError('')
    setActionMessage('')

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setSubmitting(true)

    try {
      const payload = buildPayload(form)

      if (editingSolicitud) {
        await updateSolicitud(getSolicitudId(editingSolicitud), payload)
      } else {
        await createSolicitud(payload)
      }

      await refetch()
      closeModal(true)
      setActionMessage(
        editingSolicitud
          ? 'Solicitud actualizada correctamente.'
          : 'Solicitud creada correctamente. El backend disparó el evento SOLICITUD_COMPRA_CREADA hacia n8n.',
      )
    } catch (requestError) {
      setActionError(getErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(solicitud) {
    const id = getSolicitudId(solicitud)
    const label = solicitud?.titulo || 'esta solicitud'

    if (!window.confirm(`¿Eliminar "${label}"?`)) {
      return
    }

    setActionError('')
    setActionMessage('')
    setDeletingId(id)

    try {
      await deleteSolicitud(id)
      await refetch()
      setActionMessage('Solicitud eliminada correctamente.')
    } catch (requestError) {
      setActionError(getErrorMessage(requestError))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="solicitudes-section" id="solicitudes">
      <div className="container">
        <div className="solicitudes-section__shell">
          <div className="row align-items-end g-4 mb-4">
            <div className="col-12 col-lg-7">
              <p className="solicitudes-section__eyebrow">Módulo real · n8n activado</p>
              <h2 className="solicitudes-section__title">Solicitudes de compra</h2>
              <code className="solicitudes-section__endpoint">/api/solicitudes-compra</code>
              <p className="solicitudes-section__api-note">
                Crea, edita y gestiona solicitudes conectadas al backend real. Cada solicitud nueva dispara automáticamente el evento
                {' '}<strong>SOLICITUD_COMPRA_CREADA</strong> hacia n8n.
              </p>
            </div>
            <div className="col-12 col-lg-5 text-lg-end">
              <p className="solicitudes-section__intro">
                Gestiona requerimientos de compra desde su creación hasta completado, con trazabilidad completa y automatización.
              </p>
              <div className="solicitudes-section__header-actions">
                <button
                  className="solicitudes-section__ghost-action"
                  type="button"
                  onClick={() => {
                    handleRefresh().catch(() => {})
                  }}
                  disabled={loading}
                >
                  {loading ? 'Actualizando...' : 'Refrescar'}
                </button>
                <button className="solicitudes-section__primary-action" type="button" onClick={openCreateModal}>
                  Nueva solicitud
                </button>
              </div>
            </div>
          </div>

          {actionError && <div className="solicitudes-section__alert">{actionError}</div>}
          {actionMessage && <div className="solicitudes-section__success">{actionMessage}</div>}

          <article className="solicitudes-section__table-card">
            <div className="solicitudes-section__table-header">
              <div>
                <strong>{loading ? 'Sincronizando solicitudes' : `${total} solicitudes`}</strong>
                <span>{loading ? 'Consultando API REST...' : 'Página 0 · tamaño 20'}</span>
              </div>
              <button
                className="solicitudes-section__ghost-action"
                type="button"
                onClick={() => {
                  handleRefresh().catch(() => {})
                }}
                disabled={loading}
              >
                {loading ? 'Actualizando...' : 'Refrescar'}
              </button>
            </div>

            {error && (
              <div className="solicitudes-section__error">
                <strong>No se pudo cargar solicitudes.</strong>
                <p>{getErrorMessage(error)}</p>
              </div>
            )}

            {loading && (
              <div className="solicitudes-section__loading">
                Cargando solicitudes desde /api/solicitudes-compra...
              </div>
            )}

            {!loading && !error && solicitudes.length === 0 && (
              <div className="solicitudes-section__empty">
                <strong>No hay solicitudes registradas.</strong>
                <p>
                  Cuando el backend devuelva registros, aparecerán aquí con acciones de edición y eliminación.
                  Cada nueva solicitud dispara el evento <strong>SOLICITUD_COMPRA_CREADA</strong> hacia n8n.
                </p>
                <button className="solicitudes-section__primary-action" type="button" onClick={openCreateModal}>
                  Crear primera solicitud
                </button>
              </div>
            )}

            {!loading && !error && solicitudes.length > 0 && (
              <div className="table-responsive">
                <table className="table solicitudes-section__table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Título</th>
                      <th>Categoría</th>
                      <th>Monto estimado</th>
                      <th>Estado</th>
                      <th>Fecha requerida</th>
                      <th>Solicitante ID</th>
                      <th>Creado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.map((solicitud) => {
                      const id = getSolicitudId(solicitud)
                      const isHighPriority = Number(solicitud.montoEstimado) >= HIGH_PRIORITY_THRESHOLD

                      return (
                        <tr key={id}>
                          <td><code>{id ?? '-'}</code></td>
                          <td>
                            <div className="solicitudes-section__titulo-cell">
                              <span>{solicitud.titulo || '-'}</span>
                              {isHighPriority && (
                                <span className="solicitudes-section__badge--alta-prioridad">
                                  ALTA PRIORIDAD · Dispara alerta n8n
                                </span>
                              )}
                            </div>
                          </td>
                          <td>{solicitud.categoria || '-'}</td>
                          <td className="solicitudes-section__monto">{formatMonto(solicitud.montoEstimado)}</td>
                          <td>
                            <span className={`solicitudes-section__badge solicitudes-section__badge--${(solicitud.estado || 'PENDIENTE').toLowerCase().replace('_', '-')}`}>
                              {solicitud.estado || 'PENDIENTE'}
                            </span>
                          </td>
                          <td>{formatDate(solicitud.fechaRequerida)}</td>
                          <td>{solicitud.usuarioSolicitanteId ?? '-'}</td>
                          <td>{formatDate(solicitud.creadoEn || solicitud.createdAt || solicitud.fechaCreacion)}</td>
                          <td>
                            <div className="solicitudes-section__actions">
                              <button type="button" onClick={() => openEditModal(solicitud)}>Editar</button>
                              <button
                                className="is-danger"
                                type="button"
                                onClick={() => {
                                  handleDelete(solicitud).catch(() => {})
                                }}
                                disabled={deletingId === id}
                              >
                                {deletingId === id ? 'Eliminando' : 'Eliminar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </div>
      </div>

      {isModalOpen && (
        <div className="solicitudes-section__modal-backdrop" role="presentation">
          <div
            className="solicitudes-section__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="solicitud-modal-title"
          >
            <div className="solicitudes-section__modal-header">
              <div>
                <span>{editingSolicitud ? 'Editar solicitud' : 'Nueva solicitud'}</span>
                <h3 id="solicitud-modal-title">
                  {editingSolicitud ? form.titulo : 'Nueva solicitud de compra'}
                </h3>
              </div>
              <button type="button" onClick={() => closeModal()} aria-label="Cerrar modal">×</button>
            </div>

            <form className="solicitudes-section__form" onSubmit={handleSubmit} noValidate>
              <p className="solicitudes-section__form-note">
                Campos marcados con * son obligatorios. Al crear, el backend dispara <strong>SOLICITUD_COMPRA_CREADA</strong> hacia n8n automáticamente.
              </p>

              {actionError && <div className="solicitudes-section__alert">{actionError}</div>}

              <div className="row g-3">
                <div className="col-12">
                  <label htmlFor="solicitud-titulo">Título *</label>
                  <input
                    id="solicitud-titulo"
                    autoComplete="off"
                    name="titulo"
                    value={form.titulo}
                    onChange={handleFieldChange}
                  />
                  {formErrors.titulo && <small>{formErrors.titulo}</small>}
                </div>

                <div className="col-12">
                  <label htmlFor="solicitud-descripcion">Descripción</label>
                  <textarea
                    id="solicitud-descripcion"
                    name="descripcion"
                    rows={3}
                    value={form.descripcion}
                    onChange={handleFieldChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="solicitud-categoria">Categoría</label>
                  <input
                    id="solicitud-categoria"
                    autoComplete="off"
                    name="categoria"
                    value={form.categoria}
                    onChange={handleFieldChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="solicitud-monto">Monto estimado (CLP) *</label>
                  <input
                    id="solicitud-monto"
                    min="0"
                    name="montoEstimado"
                    type="number"
                    value={form.montoEstimado}
                    onChange={handleFieldChange}
                  />
                  {formErrors.montoEstimado && <small>{formErrors.montoEstimado}</small>}
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="solicitud-fecha">Fecha requerida</label>
                  <input
                    id="solicitud-fecha"
                    min={getTodayIso()}
                    name="fechaRequerida"
                    type="date"
                    value={form.fechaRequerida}
                    onChange={handleFieldChange}
                  />
                  {formErrors.fechaRequerida && <small>{formErrors.fechaRequerida}</small>}
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="solicitud-estado">Estado</label>
                  <select
                    id="solicitud-estado"
                    name="estado"
                    value={form.estado}
                    onChange={handleFieldChange}
                  >
                    {ESTADOS.map((estado) => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="solicitud-usuario">ID usuario solicitante</label>
                  <input
                    id="solicitud-usuario"
                    min="1"
                    name="usuarioSolicitanteId"
                    type="number"
                    value={form.usuarioSolicitanteId}
                    onChange={handleFieldChange}
                  />
                  {formErrors.usuarioSolicitanteId && <small>{formErrors.usuarioSolicitanteId}</small>}
                </div>
              </div>

              <div className="solicitudes-section__modal-actions">
                <button type="button" onClick={() => closeModal()} disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Guardar solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default SolicitudesSection
