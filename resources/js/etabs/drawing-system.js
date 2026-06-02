// resources/js/etabs/drawing-system.js
export class DrawingSystem {
  constructor(canvas) {
    this.canvas = canvas
    if (!canvas) {
      console.error('Canvas no proporcionado')
      return
    }
    
    this.ctx = canvas.getContext('2d')
    if (!this.ctx) {
      console.error('No se pudo obtener el contexto 2D del canvas')
      return
    }
    
    this.drawings = []
    this.currentMode = 'select' // 'line', 'circle', 'rectangle', 'select'
    this.startPoint = null
    this.isDrawing = false
    this.tempDrawing = null
    
    this.setupContext()
    this.setupEventListeners()
    console.log('DrawingSystem inicializado correctamente')
  }
  
  setupContext() {
    if (!this.ctx) return
    
    this.ctx.lineWidth = 2
    this.ctx.strokeStyle = '#ff4444'
    this.ctx.fillStyle = '#ff4444'
    this.ctx.font = '12px Arial'
    this.ctx.setLineDash([])
  }
  
  setupEventListeners() {
    if (!this.canvas) return
    
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this))
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this))
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this))
    this.canvas.addEventListener('click', this.onClick.bind(this))
    
    console.log('Event listeners configurados')
  }
  
  setMode(mode) {
    this.currentMode = mode
    this.startPoint = null
    this.isDrawing = false
    this.updateCursor()
    console.log('Modo cambiado a:', mode)
  }
  
  updateCursor() {
    if (!this.canvas) return
    
    switch (this.currentMode) {
      case 'line':
        this.canvas.style.cursor = 'crosshair'
        break
      case 'circle':
        this.canvas.style.cursor = 'cell'
        break
      case 'rectangle':
        this.canvas.style.cursor = 'pointer'
        break
      default:
        this.canvas.style.cursor = 'default'
    }
  }
  
  getCanvasCoordinates(event) {
    if (!this.canvas) return { x: 0, y: 0 }
    
    const rect = this.canvas.getBoundingClientRect()
    const scaleX = this.canvas.width / rect.width
    const scaleY = this.canvas.height / rect.height
    
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    }
  }
  
  onMouseDown(event) {
    if (this.currentMode === 'select') return
    
    const { x, y } = this.getCanvasCoordinates(event)
    this.startPoint = { x, y }
    this.isDrawing = true
  }
  
  onMouseMove(event) {
    if (!this.isDrawing || !this.startPoint || this.currentMode === 'select') return
    
    const { x, y } = this.getCanvasCoordinates(event)
    
    // Redibujar todo
    this.redrawAll()
    
    // Dibujar la forma temporal
    if (this.ctx) {
      this.ctx.save()
      this.ctx.strokeStyle = '#ff8888'
      this.ctx.setLineDash([5, 5])
      
      switch (this.currentMode) {
        case 'line':
          this.ctx.beginPath()
          this.ctx.moveTo(this.startPoint.x, this.startPoint.y)
          this.ctx.lineTo(x, y)
          this.ctx.stroke()
          break
        case 'circle':
          const radius = Math.sqrt(
            Math.pow(x - this.startPoint.x, 2) + 
            Math.pow(y - this.startPoint.y, 2)
          )
          this.ctx.beginPath()
          this.ctx.arc(this.startPoint.x, this.startPoint.y, radius, 0, 2 * Math.PI)
          this.ctx.stroke()
          break
        case 'rectangle':
          const width = x - this.startPoint.x
          const height = y - this.startPoint.y
          this.ctx.strokeRect(this.startPoint.x, this.startPoint.y, width, height)
          break
      }
      
      this.ctx.restore()
    }
  }
  
  onMouseUp(event) {
    if (!this.isDrawing || !this.startPoint || this.currentMode === 'select') {
      this.isDrawing = false
      this.startPoint = null
      return
    }
    
    const { x, y } = this.getCanvasCoordinates(event)
    
    // Guardar el dibujo final
    switch (this.currentMode) {
      case 'line':
        this.drawings.push({
          type: 'line',
          x1: this.startPoint.x,
          y1: this.startPoint.y,
          x2: x,
          y2: y
        })
        console.log('Línea guardada:', this.drawings[this.drawings.length - 1])
        break
      case 'circle':
        const radius = Math.sqrt(
          Math.pow(x - this.startPoint.x, 2) + 
          Math.pow(y - this.startPoint.y, 2)
        )
        this.drawings.push({
          type: 'circle',
          x: this.startPoint.x,
          y: this.startPoint.y,
          radius: radius
        })
        console.log('Círculo guardado:', this.drawings[this.drawings.length - 1])
        break
      case 'rectangle':
        this.drawings.push({
          type: 'rectangle',
          x: this.startPoint.x,
          y: this.startPoint.y,
          width: x - this.startPoint.x,
          height: y - this.startPoint.y
        })
        console.log('Rectángulo guardado:', this.drawings[this.drawings.length - 1])
        break
    }
    
    this.startPoint = null
    this.isDrawing = false
    this.redrawAll()
  }
  
  onClick(event) {
    if (this.currentMode === 'select') {
      const { x, y } = this.getCanvasCoordinates(event)
      const selected = this.findDrawingAtPoint(x, y)
      if (selected) {
        console.log('Elemento seleccionado:', selected)
        this.highlightDrawing(selected)
      }
    }
  }
  
  findDrawingAtPoint(x, y, tolerance = 5) {
    for (const drawing of this.drawings) {
      if (drawing.type === 'line') {
        // Calcular distancia punto-línea
        const A = { x: drawing.x1, y: drawing.y1 }
        const B = { x: drawing.x2, y: drawing.y2 }
        const P = { x, y }
        
        const ABx = B.x - A.x
        const ABy = B.y - A.y
        const t = ((P.x - A.x) * ABx + (P.y - A.y) * ABy) / (ABx * ABx + ABy * ABy)
        
        if (t >= 0 && t <= 1) {
          const projX = A.x + t * ABx
          const projY = A.y + t * ABy
          const dist = Math.sqrt(Math.pow(P.x - projX, 2) + Math.pow(P.y - projY, 2))
          if (dist <= tolerance) return drawing
        }
      } else if (drawing.type === 'circle') {
        const dist = Math.sqrt(Math.pow(x - drawing.x, 2) + Math.pow(y - drawing.y, 2))
        if (Math.abs(dist - drawing.radius) <= tolerance) return drawing
      } else if (drawing.type === 'rectangle') {
        if (x >= drawing.x && x <= drawing.x + drawing.width &&
            y >= drawing.y && y <= drawing.y + drawing.height) {
          return drawing
        }
      }
    }
    return null
  }
  
  highlightDrawing(drawing) {
    if (!this.ctx) return
    
    this.redrawAll()
    this.ctx.save()
    this.ctx.strokeStyle = '#00ff00'
    this.ctx.lineWidth = 3
    
    switch (drawing.type) {
      case 'line':
        this.ctx.beginPath()
        this.ctx.moveTo(drawing.x1, drawing.y1)
        this.ctx.lineTo(drawing.x2, drawing.y2)
        this.ctx.stroke()
        break
      case 'circle':
        this.ctx.beginPath()
        this.ctx.arc(drawing.x, drawing.y, drawing.radius, 0, 2 * Math.PI)
        this.ctx.stroke()
        break
      case 'rectangle':
        this.ctx.strokeRect(drawing.x, drawing.y, drawing.width, drawing.height)
        break
    }
    
    this.ctx.restore()
  }
  
  redrawAll() {
    if (!this.ctx || !this.canvas) return
    
    // Limpiar canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    
    // Dibujar todos los elementos guardados
    this.drawings.forEach(drawing => {
      this.ctx.save()
      this.ctx.strokeStyle = '#ff4444'
      this.ctx.fillStyle = '#ff4444'
      this.ctx.lineWidth = 2
      this.ctx.setLineDash([])
      
      switch (drawing.type) {
        case 'line':
          this.ctx.beginPath()
          this.ctx.moveTo(drawing.x1, drawing.y1)
          this.ctx.lineTo(drawing.x2, drawing.y2)
          this.ctx.stroke()
          break
        case 'circle':
          this.ctx.beginPath()
          this.ctx.arc(drawing.x, drawing.y, drawing.radius, 0, 2 * Math.PI)
          this.ctx.stroke()
          break
        case 'rectangle':
          this.ctx.strokeRect(drawing.x, drawing.y, drawing.width, drawing.height)
          break
      }
      
      this.ctx.restore()
    })
  }
  
  clear() {
    this.drawings = []
    this.redrawAll()
    console.log('Todos los dibujos eliminados')
  }
  
  destroy() {
    if (this.canvas) {
      this.canvas.removeEventListener('mousedown', this.onMouseDown)
      this.canvas.removeEventListener('mousemove', this.onMouseMove)
      this.canvas.removeEventListener('mouseup', this.onMouseUp)
      this.canvas.removeEventListener('click', this.onClick)
    }
    console.log('DrawingSystem destruido')
  }
  
  exportDrawings() {
    return JSON.stringify(this.drawings)
  }
  
  importDrawings(json) {
    try {
      this.drawings = JSON.parse(json)
      this.redrawAll()
      console.log('Dibujos importados correctamente')
    } catch (e) {
      console.error('Error al importar dibujos:', e)
    }
  }
}