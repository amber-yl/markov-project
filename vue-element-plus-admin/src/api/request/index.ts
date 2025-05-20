import request from '@/axios'
import { RequestResponse } from './types'

export const request_get_api = () => {
  return request.get<IResponse<RequestResponse>>({
    url: '/v1/requests'
  })
}
