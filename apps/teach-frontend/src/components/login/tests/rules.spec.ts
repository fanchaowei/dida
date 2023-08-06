import { describe, expect, it } from 'vitest'
import { createConfirmPasswordRule, createPasswordRule, createUsernameRule } from '../rules'

describe('rules', () => {
  it('表单验证：用户名', () => {
    expect(createUsernameRule()).toMatchSnapshot()
  })
  it('表单验证：密码', () => {
    expect(createPasswordRule()).toMatchSnapshot()
  })
  it('表单验证：确认密码', () => {
    expect(createConfirmPasswordRule({ password: '' })).toMatchSnapshot()
  })
  it('表单验证：用户名', () => {
    expect(createUsernameRule()).toMatchInlineSnapshot(`
      [
        {
          "message": "请输入帐号",
          "required": true,
          "trigger": "blur",
        },
        {
          "message": "长度要大于 6 小于 30",
          "trigger": "blur",
          "validator": [Function],
        },
      ]
    `)
  })
  it('表单验证：密码', () => {
    expect(createPasswordRule()).toMatchInlineSnapshot(`
      [
        {
          "message": "请输入密码",
          "required": true,
          "trigger": "blur",
        },
        {
          "message": "长度要大于 6 小于 30",
          "trigger": "blur",
          "validator": [Function],
        },
      ]
    `)
  })
  it('表单验证：确认密码', () => {
    expect(createConfirmPasswordRule({ password: '' })).toMatchInlineSnapshot(`
      [
        {
          "message": "请再次输入密码",
          "required": true,
          "trigger": [
            "input",
            "blur",
          ],
        },
        {
          "message": "两次密码输入不一致",
          "trigger": [
            "blur",
            "password-input",
          ],
          "validator": [Function],
        },
      ]
    `)
  })
})
