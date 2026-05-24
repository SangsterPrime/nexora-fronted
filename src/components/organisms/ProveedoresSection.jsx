import { useCallback, useState } from 'react'
import useApiResource from '../../hooks/useApiResource'
import {
  createProveedor,
  deleteProveedor,
  listProveedores,
  updateProveedor,
} from '../../services/proveedorService'
import '../../styles/organisms/ProveedoresSection.css'

const estados = ['ACTIVO', 'INACTIVO', 'SUSPENDIDO']

const emptyForm = {
  rut: '',
  razonSocial: '',
  nombreContacto: '',
  email: '',
  telefono: '',
  direccion: '',
  reputacionScore: 0,
  cumplimientoScore: 0,
  estado: 'ACTIVO',
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

function getProveedorId(proveedor) {
  return proveedor?.id ?? proveedor?.proveedorId ?? proveedor?.rut
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

  if (error.status) {
    return `${error.message || 'No fue posible completar la operación.'} (HTTP ${error.status})`
  }

  return error.message || 'No fue posible completar la operación. Verifica que el backend esté ejecutándose.'
}

function validateForm(form) {
  const errors = {}
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!form.rut.trim()) {
    errors.rut = 'El RUT es requerido.'
  }

  if (!form.razonSocial.trim()) {
    errors.razonSocial = 'La razón social es requerida.'
  }

  if (!form.email.trim()) {
    errors.email = 'El email es requerido.'
  } else if (!emailPattern.test(form.email)) {
    errors.email = 'Ingresa un email válido.'
  }

  if (Number(form.reputacionScore) < 0) {
    errors.reputacionScore = 'La reputación no puede ser negativa.'
  }

  if (Number(form.cumplimientoScore) < 0) {
    errors.cumplimientoScore = 'El cumplimiento no puede ser negativo.'
  }

  return errors
}

function buildPayload(form) {
  return {
    ...form,
    reputacionScore: Number(form.reputacionScore),
    cumplimientoScore: Number(form.cumplimientoScore),
  }
}

function ProveedoresSection() {
  const requestProveedores = useCallback(() => listProveedores({ page: 0, size: 20 }), [])
  const { data, loading, error, refetch } = useApiResource(requestProveedores)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProveedor, setEditingProveedor] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const proveedores = getContent(data)
  const total = typeof data?.totalElements === 'number' ? data.totalElements : proveedores.length

  function openCreateModal() {
    setEditingProveedor(null)
    setForm(emptyForm)
    setFormErrors({})
    setActionError('')
    setActionMessage('')
    setIsModalOpen(true)
  }

  function openEditModal(proveedor) {
    setEditingProveedor(proveedor)
    setForm({
      rut: proveedor?.rut || '',
      razonSocial: proveedor?.razonSocial || '',
      nombreContacto: proveedor?.nombreContacto || '',
      email: proveedor?.email || '',
      telefono: proveedor?.telefono || '',
      direccion: proveedor?.direccion || '',
      reputacionScore: proveedor?.reputacionScore ?? 0,
      cumplimientoScore: proveedor?.cumplimientoScore ?? 0,
      estado: proveedor?.estado || 'ACTIVO',
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
    setEditingProveedor(null)
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
      setActionMessage('Proveedores sincronizados con /api/proveedores.')
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
      if (editingProveedor) {
        await updateProveedor(getProveedorId(editingProveedor), payload)
      } else {
        await createProveedor(payload)
      }

      await refetch()
      closeModal(true)
      setActionMessage(editingProveedor ? 'Proveedor actualizado correctamente.' : 'Proveedor creado correctamente.')
    } catch (requestError) {
      setActionError(getErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(proveedor) {
    const id = getProveedorId(proveedor)
    const label = proveedor?.razonSocial || proveedor?.rut || 'este proveedor'

    if (!window.confirm(`¿Eliminar ${label}?`)) {
      return
    }

    setActionError('')
    setActionMessage('')
    setDeletingId(id)

    try {
      await deleteProveedor(id)
      await refetch()
      setActionMessage('Proveedor eliminado correctamente.')
    } catch (requestError) {
      setActionError(getErrorMessage(requestError))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="proveedores-section" id="proveedores">
      <div className="container">
        <div className="proveedores-section__shell">
          <div className="row align-items-end g-4 mb-4">
            <div className="col-12 col-lg-7">
              <p className="proveedores-section__eyebrow">CRUD conectado</p>
              <h2 className="proveedores-section__title">Proveedores</h2>
              <code className="proveedores-section__endpoint">/api/proveedores</code>
            </div>
            <div className="col-12 col-lg-5 text-lg-end">
              <p className="proveedores-section__intro">
                Gestión real de proveedores del ciclo de abastecimiento. Alta, edición, eliminación y refresco contra Spring Boot local.
              </p>
              <div className="proveedores-section__header-actions">
                <button
                  className="proveedores-section__ghost-action"
                  type="button"
                  onClick={() => {
                    handleRefresh().catch(() => {})
                  }}
                  disabled={loading}
                >
                  {loading ? 'Actualizando...' : 'Refrescar'}
                </button>
                <button className="proveedores-section__primary-action" type="button" onClick={openCreateModal}>
                  Nuevo proveedor
                </button>
              </div>
            </div>
          </div>

          {actionError && <div className="proveedores-section__alert">{actionError}</div>}
          {actionMessage && <div className="proveedores-section__success">{actionMessage}</div>}

          <article className="proveedores-section__table-card">
            <div className="proveedores-section__table-header">
              <div>
                <strong>{loading ? 'Sincronizando proveedores' : `${total} proveedores`}</strong>
                <span>{loading ? 'Consultando API REST...' : 'Página 0 · tamaño 20'}</span>
              </div>
              <button
                className="proveedores-section__ghost-action"
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
              <div className="proveedores-section__error">
                <strong>No se pudo cargar proveedores.</strong>
                <p>{getErrorMessage(error)}</p>
              </div>
            )}

            {loading && <div className="proveedores-section__loading">Cargando proveedores desde /api/proveedores...</div>}

            {!loading && !error && proveedores.length === 0 && (
              <div className="proveedores-section__empty">
                <strong>No hay proveedores registrados.</strong>
                <p>Cuando el backend devuelva registros en <code>/api/proveedores</code>, aparecerán aquí con acciones de edición y eliminación.</p>
                <button className="proveedores-section__primary-action" type="button" onClick={openCreateModal}>
                  Crear primer proveedor
                </button>
              </div>
            )}

            {!loading && !error && proveedores.length > 0 && (
              <div className="table-responsive">
                <table className="table proveedores-section__table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>RUT</th>
                      <th>Razón social</th>
                      <th>Contacto</th>
                      <th>Email</th>
                      <th>Scores</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proveedores.map((proveedor) => {
                      const id = getProveedorId(proveedor)
                      return (
                        <tr key={id}>
                          <td><code>{proveedor.rut || '-'}</code></td>
                          <td>{proveedor.razonSocial || '-'}</td>
                          <td>{proveedor.nombreContacto || '-'}</td>
                          <td>{proveedor.email || '-'}</td>
                          <td>
                            <span className="proveedores-section__score">R {proveedor.reputacionScore ?? 0}</span>
                            <span className="proveedores-section__score">C {proveedor.cumplimientoScore ?? 0}</span>
                          </td>
                          <td>
                            <span className={`proveedores-section__badge proveedores-section__badge--${(proveedor.estado || 'ACTIVO').toLowerCase()}`}>
                              {proveedor.estado || 'ACTIVO'}
                            </span>
                          </td>
                          <td>
                            <div className="proveedores-section__actions">
                              <button type="button" onClick={() => openEditModal(proveedor)}>Editar</button>
                              <button
                                className="is-danger"
                                type="button"
                                onClick={() => {
                                  handleDelete(proveedor).catch(() => {})
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
        <div className="proveedores-section__modal-backdrop" role="presentation">
          <div className="proveedores-section__modal" role="dialog" aria-modal="true" aria-labelledby="proveedor-modal-title">
            <div className="proveedores-section__modal-header">
              <div>
                <span>{editingProveedor ? 'Editar proveedor' : 'Nuevo proveedor'}</span>
                <h3 id="proveedor-modal-title">{editingProveedor ? form.razonSocial : 'Registro proveedor'}</h3>
              </div>
              <button type="button" onClick={closeModal} aria-label="Cerrar modal">×</button>
            </div>

            <form className="proveedores-section__form" onSubmit={handleSubmit} noValidate>
              <p className="proveedores-section__form-note">
                Campos marcados con * son obligatorios. Los mensajes del backend se muestran sin ocultar el formulario.
              </p>
              {actionError && <div className="proveedores-section__alert">{actionError}</div>}

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label htmlFor="proveedor-rut">RUT *</label>
                  <input id="proveedor-rut" name="rut" value={form.rut} onChange={handleFieldChange} autoComplete="off" />
                  {formErrors.rut && <small>{formErrors.rut}</small>}
                </div>
                <div className="col-12 col-md-6">
                  <label htmlFor="proveedor-razon-social">Razón social *</label>
                  <input id="proveedor-razon-social" name="razonSocial" value={form.razonSocial} onChange={handleFieldChange} autoComplete="organization" />
                  {formErrors.razonSocial && <small>{formErrors.razonSocial}</small>}
                </div>
                <div className="col-12 col-md-6">
                  <label htmlFor="proveedor-contacto">Nombre contacto</label>
                  <input id="proveedor-contacto" name="nombreContacto" value={form.nombreContacto} onChange={handleFieldChange} autoComplete="name" />
                </div>
                <div className="col-12 col-md-6">
                  <label htmlFor="proveedor-email">Email *</label>
                  <input id="proveedor-email" name="email" type="email" value={form.email} onChange={handleFieldChange} autoComplete="email" />
                  {formErrors.email && <small>{formErrors.email}</small>}
                </div>
                <div className="col-12 col-md-6">
                  <label htmlFor="proveedor-telefono">Teléfono</label>
                  <input id="proveedor-telefono" name="telefono" value={form.telefono} onChange={handleFieldChange} autoComplete="tel" />
                </div>
                <div className="col-12 col-md-6">
                  <label htmlFor="proveedor-estado">Estado</label>
                  <select id="proveedor-estado" name="estado" value={form.estado} onChange={handleFieldChange}>
                    {estados.map((estado) => (
                      <option value={estado} key={estado}>{estado}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label htmlFor="proveedor-direccion">Dirección</label>
                  <input id="proveedor-direccion" name="direccion" value={form.direccion} onChange={handleFieldChange} autoComplete="street-address" />
                </div>
                <div className="col-12 col-md-6">
                  <label htmlFor="proveedor-reputacion">Reputación score</label>
                  <input
                    id="proveedor-reputacion"
                    min="0"
                    name="reputacionScore"
                    type="number"
                    value={form.reputacionScore}
                    onChange={handleFieldChange}
                  />
                  {formErrors.reputacionScore && <small>{formErrors.reputacionScore}</small>}
                </div>
                <div className="col-12 col-md-6">
                  <label htmlFor="proveedor-cumplimiento">Cumplimiento score</label>
                  <input
                    id="proveedor-cumplimiento"
                    min="0"
                    name="cumplimientoScore"
                    type="number"
                    value={form.cumplimientoScore}
                    onChange={handleFieldChange}
                  />
                  {formErrors.cumplimientoScore && <small>{formErrors.cumplimientoScore}</small>}
                </div>
              </div>

              <div className="proveedores-section__modal-actions">
                <button type="button" onClick={closeModal} disabled={submitting}>Cancelar</button>
                <button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar proveedor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default ProveedoresSection
