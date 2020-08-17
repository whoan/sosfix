const messagesByCategory = require('./messages-by-category.json')

const messagesByType = Object.keys(messagesByCategory).reduce((outputByType, category) => {
  return {
    ...Object.keys(messagesByCategory[category]).reduce((outputByCategory, subCategory) => {
      return {
        ...Object.keys(messagesByCategory[category][subCategory]).reduce((outputBySubcategory, msgTypeOrSubSUbCategory) => {
          const name = messagesByCategory[category][subCategory][msgTypeOrSubSUbCategory]
          if (typeof name === 'string' || name instanceof String) {
            outputBySubcategory[msgTypeOrSubSUbCategory] = {
              name,
              category,
              subCategory
            }
            return outputBySubcategory
          }
          return {
            ...Object.keys(name).reduce((outputBySubSubcategory, msgType) => {
              outputBySubSubcategory[msgType] = {
                name: name[msgType],
                category,
                subCategory,
                subSubCategory: msgTypeOrSubSUbCategory
              }
              return outputBySubSubcategory
            }, {}),
            ...outputBySubcategory
          }
        }, {}),
        ...outputByCategory
      }
    }, {}),
    ...outputByType
  }
}, {})

// list of messages generated by the institution side which do not end with Request
const institutionSideMessages = {
  Z: 'QuoteCancel',
  i: 'MassQuote',

  D: 'NewOrderSingle',
  Q: 'DontKnowTradeDK',

  L: 'ListExecute',

  s: 'NewOrderCross',

  AB: 'NewOrderMultileg',
  AC: 'MultilegOrderCancelReplace',

  J: 'AllocationInstruction',
  AS: 'AllocationReport',

  o: 'RegistrationInstructions',

  AR: 'TradeCaptureReportAck',

  AU: 'Confirmation_Ack', // TODO: I am not sure

  AN: 'RequestForPositions',

  BB: 'CollateralInquiry',

  BN: 'ExecutionAcknowledgement'
}

// list of messages generated by both sides which do not end with Request
const bothSidesMessages = {
  6: 'IOI', // TODO: is it generated by both sides?
  7: 'Advertisement', // TODO: is it generated by both sides?

  B: 'News',
  C: 'Email',

  E: 'NewOrderList', // TODO: is it generated by both sides?

  T: 'SettlementInstructions',

  AY: 'CollateralAssignment', // TODO: is it generated by both sides?

  j: 'BusinessMessageReject'
}

// TODO: Are all messages ending with Request generated by the institution side?
// ListStrikePrice <m> is only sent by broker side I think
// ??? Confirmation <AK>
// ??? Confirmation_Ack <AU>
// ??? ConfirmationRequest <BH>

class Fix {
  constructor () {
    this.messagesByType = messagesByType
    this.messagesByCategory = messagesByCategory
  }

  isAdministrative (msgType) {
    const message = this.messagesByType[msgType]
    return message && message.category === 'Session'
  }

  isInfrastructure (msgType) {
    const message = this.messagesByType[msgType]
    return message && message.category === 'Infrastructure'
  }

  isAppRequest (msgType) {
    if (!this.isStandardMessage(msgType)) {
      return undefined
    }
    return !this.isAdministrative(msgType) &&
      !this.isInfrastructure(msgType) &&
      !!(this.messagesByType[msgType].name.endsWith('Request') || institutionSideMessages[msgType] || bothSidesMessages[msgType])
  }

  isAppResponse (msgType) {
    if (!this.isStandardMessage(msgType)) {
      return undefined
    }
    return !this.isAdministrative(msgType) &&
      !this.isInfrastructure(msgType) &&
      (bothSidesMessages[msgType] || !this.isAppRequest(msgType))
  }

  isStandardMessage (msgType) {
    return this.messagesByType[msgType]
  }
}

module.exports = new Fix()
