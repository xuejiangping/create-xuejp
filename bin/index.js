
import {
  confirm,
  multiselect,
  select,
  spinner,
  text
} from '@clack/prompts'

const projectName = await text({
  message: '请输入项目名称',
  placeholder: '默认值: xuejiangping-project',
  defaultValue: 'xuejiangping-project',
  validate(value) {
    if (!value) return '项目名称不能为空'
  }
})

const useTypeScript = await confirm({
  message: '是否使用 TypeScript？',
  initialValue: true
})

const features = await multiselect({
  message: '请选择功能',
  options: [
    { value: 'eslint',label: 'ESLint' },
    { value: 'prettier',label: 'Prettier' },
    { value: 'test',label: '测试工具' }
  ],
  required: false
})

const feature = await select({
  message: '请选择功能2',
  options: [
    { value: 'eslint',label: 'ESLint' },
    { value: 'prettier',label: 'Prettier' },
    { value: 'test',label: '测试工具' }
  ],
  required: false
})
const loading = spinner()
loading.start('正在创建项目')
await new Promise((resolve) => setTimeout(resolve,1000))


loading.stop('项目创建完成')

console.log({
  projectName,
  useTypeScript,
  features,
  feature
})