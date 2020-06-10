# hcaptcha-solver

A library to solve hcaptcha challenges

## Install

```bash
npm install hcaptcha-solver
```

## Quick Example

```js
const solveCaptcha = require('hcaptcha-solver');

(async () => {
    try {
      const response = await solveCaptcha('https://captcha-protected-site.com');
      console.log(response);
      // F0_eyJ0eXAiOiJKV1Q...
    } catch (error) {
      console.log(error);
    }
})();
```

## Credits

- Thanks to [Futei](https://github.com/Futei/SineCaptcha)
