import JasmineDOM from '@testing-library/jasmine-dom/dist'
import { cleanup } from '@testing-library/react'

beforeAll(() => {
  jasmine.getEnv().addMatchers(JasmineDOM)
})

afterEach(() => {
  cleanup()
})
