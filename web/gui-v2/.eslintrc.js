export default {
  rules: {
    "import/no-anonymous-default-export": ["error", {
      "allowArray": false,
      "allowArrowFunction": false,
      "allowAnonymousClass": false,
      "allowAnonymousFunction": false,
      "allowCallExpression": false, // backward compatibility -> e.g. export default foo(bar)
      "allowNew": false,
      "allowLiteral": false,
      "allowObject": true
    }]
  }
}
