export { authApi, mapUserDTO } from './auth.service';
export type { LoginResponse, UserDTO } from './auth.service';

export { applicationApi } from './application.service';
export type { AppSettingDTO, DesktopShortcutDTO } from './application.service';

export { configurationApi } from './configuration.service';

export { eventosApi } from './eventos.service';
export type { EventoDTO, PageResponse } from './eventos.service';

export { securityApi } from './security.service';

export { systemApi } from './system.service';

export { reportesApi } from './reportes.service';

export { api, loginApi, getAccessToken, setTokens, clearTokens, handleApiError, getErrorMessage } from '@/lib/api-client';
