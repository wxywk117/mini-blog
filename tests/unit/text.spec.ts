import { describe, expect, it } from 'vitest'
import { charLength, formatCounter, validateContent } from '@/lib/text'

describe('charLength', () => {
  it('空字符串返回 0', () => {
    expect(charLength('')).toBe(0)
  })

  it('普通中英文按字符计数', () => {
    expect(charLength('hello')).toBe(5)
    expect(charLength('你好')).toBe(2)
  })

  it('按 Unicode 码点计数，表情符号算 1 个字符', () => {
    expect(charLength('👍')).toBe(1)
    expect(charLength('a👍b')).toBe(3)
  })
})

describe('validateContent', () => {
  it('空字符串判定为空', () => {
    const result = validateContent('')
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('empty')
    expect(result.length).toBe(0)
  })

  it('纯空白判定为空', () => {
    const result = validateContent('   \n\t ')
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('empty')
    expect(result.trimmed).toBe('')
  })

  it('正常内容通过校验并返回 trim 后的文本', () => {
    const result = validateContent('  hello  ')
    expect(result.ok).toBe(true)
    expect(result.reason).toBeUndefined()
    expect(result.trimmed).toBe('hello')
  })

  it('长度按原始输入（含首尾空白）的码点数统计', () => {
    expect(validateContent('  ab  ').length).toBe(6)
  })

  it('280 字符恰好通过', () => {
    const result = validateContent('a'.repeat(280))
    expect(result.ok).toBe(true)
    expect(result.length).toBe(280)
  })

  it('281 字符超出上限', () => {
    const result = validateContent('a'.repeat(281))
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('too-long')
    expect(result.length).toBe(281)
  })

  it('支持自定义上限', () => {
    expect(validateContent('abcd', 3).reason).toBe('too-long')
    expect(validateContent('abc', 3).ok).toBe(true)
  })
})

describe('formatCounter', () => {
  it('未超限时展示已输入数量', () => {
    expect(formatCounter(0, 280)).toBe('已输入 0 / 280')
    expect(formatCounter(12)).toBe('已输入 12 / 280')
  })

  it('超限时展示超出数量', () => {
    expect(formatCounter(281, 280)).toBe('已超出 1 个字符')
    expect(formatCounter(285, 280)).toBe('已超出 5 个字符')
  })
})
