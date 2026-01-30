
interface ShiftConflict {
  hasConflict: boolean
  conflictType: 'overlap' | 'double_booking' | 'outside_hours' | 'future_shift'
  message: string
}

export function checkShiftConflictsClient(startTime: Date, endTime: Date): ShiftConflict {
  if (endTime <= startTime) 
    return {
      hasConflict: true,
      conflictType: 'outside_hours',
      message: 'La hora de fin debe ser posterior a la hora de inicio',
    }
  

  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  if (startTime < oneHourAgo) 
    return {
      hasConflict: true,
      conflictType: 'future_shift',
      message: 'No se pueden programar turnos en el pasado',
    }
  

  const shiftDuration = endTime.getTime() - startTime.getTime()
  const maxDuration = 12 * 60 * 60 * 1000 
  if (shiftDuration > maxDuration) 
    return {
      hasConflict: true,
      conflictType: 'outside_hours',
      message: 'Los turnos no pueden durar más de 12 horas',
    }
  

  
  const minDuration = 30 * 60 * 1000 
  if (shiftDuration < minDuration) 
    return {
      hasConflict: true,
      conflictType: 'outside_hours',
      message: 'Los turnos deben durar al menos 30 minutos',
    }
  

  return {
    hasConflict: false,
    conflictType: 'overlap',
    message: 'No hay conflictos de horario básicos',
  }
}
