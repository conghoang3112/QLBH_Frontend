import { genMessage } from '../helper'
import antdLocale from 'ant-design-vue/es/locale/vi_VN'
import { deepMerge } from '@/utils'

const modules = import.meta.glob('./vi/**/*.{json,ts,js}', { eager: true })

export default {
  message: {
    ...genMessage(modules as Recordable<Recordable>, 'vi'),
    antdLocale: {
      ...antdLocale,
      DatePicker: deepMerge(
        antdLocale.DatePicker,
        genMessage(modules as Recordable<Recordable>, 'vi').antdLocale.DatePicker,
      ),
    },
  },
}
