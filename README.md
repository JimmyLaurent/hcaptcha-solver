# hcaptcha-solver-plus

A library to solve hcaptcha challenges

## Install

```bash
npm install hcaptcha-solver
```

## Quick Example

```js
const solveCaptcha = require("hcaptcha-solver-plus");

(async () => {
    try {
        const response = await solveCaptcha("https://captcha-protected-site.com", {
            sitekey: "site-key"
        });
        console.log(response);
        // F0_eyJ0eXAiOiJKV1Q...
    } catch (error) {
        console.log(error);
    }
})();
```

## Credits

- Original [Repository](https://github.com/JimmyLaurent/hcaptcha-solver) by [Jimmy Laurent](https://github.com/JimmyLaurent)
- Thanks to [Futei](https://github.com/Futei/SineCaptcha)