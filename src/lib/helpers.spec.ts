import * as helpers from './helpers'
import { expect } from 'chai'

describe('helpers', () => {
  describe('unwrapValue', () => {
    it('returns the value of an event target', () => {
      const event = {
        target: {
          value: 'test'
        }
      } as unknown as Event
      expect(helpers.unwrapValue(event)).to.equal('test')
    })
  })
  describe('assertNotNull', () => {
    it('takes a possibly null param and throws if it is null', () => {
      expect(() => helpers.assertNotNull(null)).to.throw()
    })
    it('takes a possibly null param and returns the value if it is not null', () => {
      expect(helpers.assertNotNull('test')).to.equal('test')
    })
  })
  describe('getElement', () => {
    it('takes a parent node and a selector and returns the element', () => {
      const htmlElement = { value: 'test' } as unknown as HTMLInputElement
      const parent = {
        querySelector: (_: string) => htmlElement
      } as unknown as ParentNode
      expect(helpers.getElement(parent, 'input')).to.equal(htmlElement)
    })
  })
})
