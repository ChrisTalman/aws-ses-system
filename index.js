(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/Modules/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/Modules/Errors.ts":
/*!*******************************!*\
  !*** ./src/Modules/Errors.ts ***!
  \*******************************/
/*! exports provided: EmailUnwantedError, EmailRateLimitError, EmailQueueTimeoutError */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"EmailUnwantedError\", function() { return EmailUnwantedError; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"EmailRateLimitError\", function() { return EmailRateLimitError; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"EmailQueueTimeoutError\", function() { return EmailQueueTimeoutError; });\n\r\nclass EmailUnwantedError extends Error {\r\n}\r\n;\r\nclass EmailRateLimitError extends Error {\r\n    constructor() {\r\n        const message = 'Rate limit reached, and request has not been marked to be queued';\r\n        super(message);\r\n    }\r\n    ;\r\n}\r\n;\r\nclass EmailQueueTimeoutError extends Error {\r\n    constructor() {\r\n        const message = 'Request was in rate limit queue for too long';\r\n        super(message);\r\n    }\r\n    ;\r\n}\r\n;\r\n\n\n//# sourceURL=webpack:///./src/Modules/Errors.ts?");

/***/ }),

/***/ "./src/Modules/Scheduler/ScheduledEmail.ts":
/*!*************************************************!*\
  !*** ./src/Modules/Scheduler/ScheduledEmail.ts ***!
  \*************************************************/
/*! exports provided: ScheduledEmail */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"ScheduledEmail\", function() { return ScheduledEmail; });\n/* harmony import */ var _chris_talman_isomorphic_utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @chris-talman/isomorphic-utilities */ \"@chris-talman/isomorphic-utilities\");\n/* harmony import */ var _chris_talman_isomorphic_utilities__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_chris_talman_isomorphic_utilities__WEBPACK_IMPORTED_MODULE_0__);\n\r\n\r\nconst INVALID_ADDRESS_ERROR_MESSAGE_EXPRESSION = /^InvalidParameterValue: Local address contains control or whitespace$/;\r\nclass ScheduledEmail {\r\n    constructor({ email, metadata, useQueue, scheduler }) {\r\n        this.executing = false;\r\n        this.executed = false;\r\n        this.email = email;\r\n        this.metadata = metadata;\r\n        this.useQueue = useQueue;\r\n        this.scheduler = scheduler;\r\n        this.promiseController = new _chris_talman_isomorphic_utilities__WEBPACK_IMPORTED_MODULE_0__[\"PromiseController\"]();\r\n        this.execute();\r\n    }\r\n    ;\r\n    async execute() {\r\n        if (this.executing || this.executed)\r\n            return;\r\n        this.executing = true;\r\n        let rateLimitConsumed = false;\r\n        try {\r\n            rateLimitConsumed = await this.scheduler.consumeRateLimit(this);\r\n        }\r\n        catch (error) {\r\n            this.reject(error);\r\n        }\r\n        ;\r\n        if (!rateLimitConsumed) {\r\n            this.executing = false;\r\n            return;\r\n        }\r\n        ;\r\n        if (this.metadata.lockId) {\r\n            try {\r\n                await this.system.callbacks.insertLock({ id: this.metadata.lockId, metadataId: this.metadataId });\r\n            }\r\n            catch (error) {\r\n                this.reject(error);\r\n                this.executing = false;\r\n                return;\r\n            }\r\n            ;\r\n        }\r\n        ;\r\n        let result;\r\n        try {\r\n            result = await this.system.nodemailer.sendMail(this.email);\r\n        }\r\n        catch (error) {\r\n            if (error.code === 'Throttling') {\r\n                this.executing = false;\r\n                this.scheduler.guaranteeQueueItem(this);\r\n                if (this.metadata.lockId) {\r\n                    try {\r\n                        await this.system.callbacks.deleteLock({ id: this.metadata.lockId });\r\n                    }\r\n                    catch (error) {\r\n                        console.error(`Failed to delete lock after throttling. Metadata ID: ${this.metadataId}`);\r\n                        this.reject(error);\r\n                    }\r\n                    ;\r\n                }\r\n                ;\r\n            }\r\n            else if (error.code === 'InvalidParameterValue' && INVALID_ADDRESS_ERROR_MESSAGE_EXPRESSION.test(error.message)) {\r\n                if (this.metadata.lockId) {\r\n                    try {\r\n                        await this.system.callbacks.deleteLock({ id: this.metadata.lockId });\r\n                        console.log(`Deleted lock after nonlockable error. Metadata ID: ${this.metadataId}`);\r\n                    }\r\n                    catch (error) {\r\n                        console.error(`Failed to delete lock after nonlockable error. Metadata ID: ${this.metadataId}`);\r\n                        this.reject(error);\r\n                    }\r\n                    ;\r\n                }\r\n                ;\r\n                this.reject(error);\r\n            }\r\n            else {\r\n                this.reject(error);\r\n            }\r\n            ;\r\n            return;\r\n        }\r\n        ;\r\n        this.scheduler.removeQueueItem(this);\r\n        this.promiseController.resolve(result);\r\n        this.markExecuted();\r\n    }\r\n    ;\r\n    reject(error) {\r\n        this.scheduler.removeQueueItem(this);\r\n        this.promiseController.reject(error);\r\n        this.markExecuted();\r\n    }\r\n    ;\r\n    markExecuted() {\r\n        this.executed = true;\r\n        this.executing = false;\r\n    }\r\n    ;\r\n}\r\n;\r\n\n\n//# sourceURL=webpack:///./src/Modules/Scheduler/ScheduledEmail.ts?");

/***/ }),

/***/ "./src/Modules/Scheduler/index.ts":
/*!****************************************!*\
  !*** ./src/Modules/Scheduler/index.ts ***!
  \****************************************/
/*! exports provided: Scheduler, RateLimitResetTimeout */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Scheduler\", function() { return Scheduler; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"RateLimitResetTimeout\", function() { return RateLimitResetTimeout; });\n/* harmony import */ var _chris_talman_isomorphic_utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @chris-talman/isomorphic-utilities */ \"@chris-talman/isomorphic-utilities\");\n/* harmony import */ var _chris_talman_isomorphic_utilities__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_chris_talman_isomorphic_utilities__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var src_Modules_Errors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/Modules/Errors */ \"./src/Modules/Errors.ts\");\n/* harmony import */ var _ScheduledEmail__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ScheduledEmail */ \"./src/Modules/Scheduler/ScheduledEmail.ts\");\n\r\n\r\n\r\n\r\n;\r\n;\r\nconst RATE_LIMIT_INTERVAL_MILLISECONDS = 1000;\r\nclass Scheduler {\r\n    constructor({ queueItemTimeout, system }) {\r\n        this.queue = [];\r\n        this.queueItemTimeout = 180000;\r\n        if (typeof queueItemTimeout === 'number')\r\n            this.queueItemTimeout = queueItemTimeout;\r\n        this.system = system;\r\n    }\r\n    ;\r\n    async schedule({ email, metadata, useQueue }) {\r\n        const scheduledEmail = new _ScheduledEmail__WEBPACK_IMPORTED_MODULE_2__[\"ScheduledEmail\"]({ email, metadata, useQueue, scheduler: this });\r\n        const result = await scheduledEmail.promiseController.promise;\r\n        return result;\r\n    }\r\n    ;\r\n    async consumeRateLimit(scheduledEmail) {\r\n        const consumed = await this.system.callbacks.consumeRateLimit();\r\n        if (!consumed && !scheduledEmail.useQueue) {\r\n            throw new src_Modules_Errors__WEBPACK_IMPORTED_MODULE_1__[\"EmailRateLimitError\"]();\r\n        }\r\n        ;\r\n        if (this.rateLimit === undefined || this.rateLimit.remaining > 0 || Date.now() >= this.rateLimit.reset) {\r\n            if (this.rateLimit !== undefined && Date.now() >= this.rateLimit.reset) {\r\n                this.rateLimit.reset = Date.now() + RATE_LIMIT_INTERVAL_MILLISECONDS;\r\n                this.rateLimit.remaining = this.system.aws.ses.rateLimits.second;\r\n            }\r\n            ;\r\n            this.recordRateLimitConsumed();\r\n            return true;\r\n        }\r\n        ;\r\n        if (!scheduledEmail.useQueue) {\r\n            throw new src_Modules_Errors__WEBPACK_IMPORTED_MODULE_1__[\"EmailRateLimitError\"]();\r\n        }\r\n        ;\r\n        this.guaranteeQueueItem(scheduledEmail);\r\n        this.timeoutQueueItem(scheduledEmail);\r\n        this.guaranteeRateLimitResetTimeout();\r\n        return false;\r\n    }\r\n    ;\r\n    async timeoutQueueItem(item) {\r\n        await Object(_chris_talman_isomorphic_utilities__WEBPACK_IMPORTED_MODULE_0__[\"delay\"])(this.queueItemTimeout);\r\n        this.removeQueueItem(item);\r\n        const timeoutError = new src_Modules_Errors__WEBPACK_IMPORTED_MODULE_1__[\"EmailQueueTimeoutError\"]();\r\n        item.promiseController.reject(timeoutError);\r\n    }\r\n    ;\r\n    guaranteeRateLimitResetTimeout() {\r\n        if ((this.rateLimitResetTimeout && !this.rateLimitResetTimeout.complete) || this.queue.length === 0)\r\n            return;\r\n        const delay = this.generateRateLimitResetDelay();\r\n        this.rateLimitResetTimeout = new RateLimitResetTimeout({ callback: () => this.processQueue(), delay });\r\n    }\r\n    ;\r\n    generateRateLimitResetDelay() {\r\n        if (this.rateLimit === undefined)\r\n            throw new Error('Rate limit undefined');\r\n        let delay = this.rateLimit.reset - Date.now();\r\n        if (delay < 0) {\r\n            delay = 0;\r\n        }\r\n        ;\r\n        return delay;\r\n    }\r\n    ;\r\n    processQueue() {\r\n        if (this.rateLimit === undefined)\r\n            throw new Error('Rate limit undefined');\r\n        const processable = this.queue.slice(0, this.system.aws.ses.rateLimits.second);\r\n        for (let item of processable) {\r\n            item.execute();\r\n        }\r\n        ;\r\n        this.guaranteeRateLimitResetTimeout();\r\n    }\r\n    ;\r\n    recordRateLimitConsumed() {\r\n        if (this.rateLimit === undefined) {\r\n            this.rateLimit =\r\n                {\r\n                    remaining: this.system.aws.ses.rateLimits.second,\r\n                    reset: Date.now() + RATE_LIMIT_INTERVAL_MILLISECONDS\r\n                };\r\n        }\r\n        ;\r\n        --this.rateLimit.remaining;\r\n    }\r\n    ;\r\n    guaranteeQueueItem(item) {\r\n        const queueItem = this.queue.find(currentItem => currentItem === item);\r\n        if (queueItem)\r\n            return;\r\n        this.queue.push(item);\r\n    }\r\n    ;\r\n    removeQueueItem(item) {\r\n        const queueItemIndex = this.queue.findIndex(currentItem => currentItem === item);\r\n        if (queueItemIndex === -1)\r\n            return;\r\n        this.queue.splice(queueItemIndex, 1);\r\n    }\r\n    ;\r\n}\r\n;\r\nclass RateLimitResetTimeout {\r\n    constructor({ callback, delay }) {\r\n        this._complete = false;\r\n        this.callback = callback;\r\n        this.timeout = setTimeout(() => this.handleComplete(), delay);\r\n    }\r\n    ;\r\n    get complete() {\r\n        return this._complete;\r\n    }\r\n    ;\r\n    handleComplete() {\r\n        this._complete = true;\r\n        this.callback();\r\n    }\r\n    ;\r\n}\r\n;\r\n\n\n//# sourceURL=webpack:///./src/Modules/Scheduler/index.ts?");

/***/ }),

/***/ "./src/Modules/Send.ts":
/*!*****************************!*\
  !*** ./src/Modules/Send.ts ***!
  \*****************************/
/*! exports provided: send */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"send\", function() { return send; });\n/* harmony import */ var src_Modules_Utilities_GenerateMetadataSesTags__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/Modules/Utilities/GenerateMetadataSesTags */ \"./src/Modules/Utilities/GenerateMetadataSesTags.ts\");\n/* harmony import */ var _Errors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Errors */ \"./src/Modules/Errors.ts\");\n\r\n\r\n\r\n;\r\n;\r\n;\r\n;\r\nasync function send({ email, metadata, lockId, useQueue = false, metadataId }) {\r\n    if (lockId) {\r\n        metadata.lockId = lockId;\r\n        const locked = await this.callbacks.isLocked({ id: lockId });\r\n        if (locked) {\r\n            console.warn(`Email cannot be sent as it is locked. Metadata ID: ${metadataId}`);\r\n            return;\r\n        }\r\n        ;\r\n    }\r\n    ;\r\n    const recipient = typeof email.to === 'string' ? email.to : email.to.address;\r\n    const unwanted = await this.callbacks.isUnwanted({ recipient });\r\n    if (unwanted) {\r\n        throw new _Errors__WEBPACK_IMPORTED_MODULE_1__[\"EmailUnwantedError\"]();\r\n    }\r\n    ;\r\n    const metadataDocument = await this.callbacks.insertMetadata({ id: metadataId, metadata });\r\n    const mailOptions = {\r\n        to: email.to,\r\n        from: generateMailFrom({ email, system: this }),\r\n        subject: email.subject,\r\n        text: email.text,\r\n        html: email.html,\r\n        ses: {\r\n            ConfigurationSetName: this.aws.configurationSet,\r\n            Tags: Object(src_Modules_Utilities_GenerateMetadataSesTags__WEBPACK_IMPORTED_MODULE_0__[\"generateMetadataSesTags\"])({ metadataId: metadataDocument.id })\r\n        },\r\n        headers: email.headers\r\n    };\r\n    const result = await this.scheduler.schedule({ email: mailOptions, metadata, useQueue });\r\n    return result;\r\n}\r\n;\r\nfunction generateMailFrom({ email, system }) {\r\n    let from = {\r\n        address: system.email.from,\r\n        name: system.email.fromName\r\n    };\r\n    if (email.from) {\r\n        if (typeof email.from === 'object') {\r\n            if (email.from.address !== undefined) {\r\n                from.address = email.from.address;\r\n            }\r\n            ;\r\n            if (email.from.name !== undefined) {\r\n                from.name = email.from.name;\r\n            }\r\n            ;\r\n        }\r\n        else {\r\n            from = email.from;\r\n        }\r\n        ;\r\n    }\r\n    ;\r\n    return from;\r\n}\r\n;\r\n\n\n//# sourceURL=webpack:///./src/Modules/Send.ts?");

/***/ }),

/***/ "./src/Modules/Utilities/GenerateMetadataSesTags.ts":
/*!**********************************************************!*\
  !*** ./src/Modules/Utilities/GenerateMetadataSesTags.ts ***!
  \**********************************************************/
/*! exports provided: generateMetadataSesTags */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"generateMetadataSesTags\", function() { return generateMetadataSesTags; });\n\r\n;\r\n;\r\nfunction generateMetadataSesTags(metadata) {\r\n    const tags = [];\r\n    const keys = Object.keys(metadata);\r\n    for (let key of keys) {\r\n        const value = metadata[key];\r\n        tags.push({ Name: key, Value: value });\r\n    }\r\n    ;\r\n    return tags;\r\n}\r\n;\r\n\n\n//# sourceURL=webpack:///./src/Modules/Utilities/GenerateMetadataSesTags.ts?");

/***/ }),

/***/ "./src/Modules/index.ts":
/*!******************************!*\
  !*** ./src/Modules/index.ts ***!
  \******************************/
/*! exports provided: EmailSystem */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"EmailSystem\", function() { return EmailSystem; });\n/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ \"aws-sdk\");\n/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var nodemailer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! nodemailer */ \"nodemailer\");\n/* harmony import */ var nodemailer__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(nodemailer__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _Send__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Send */ \"./src/Modules/Send.ts\");\n/* harmony import */ var _Scheduler__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Scheduler */ \"./src/Modules/Scheduler/index.ts\");\n\r\n\r\n\r\n\r\n\r\n;\r\n;\r\n;\r\n;\r\n;\r\n;\r\n;\r\nconst AWS_SES_DEFAULT_VERSION = '2010-12-01';\r\nconst AWS_SNS_DEFAULT_VERSION = '2010-03-31';\r\nclass EmailSystem {\r\n    constructor({ callbacks, email, aws, queueItemTimeout }) {\r\n        this.send = _Send__WEBPACK_IMPORTED_MODULE_2__[\"send\"];\r\n        this.callbacks = callbacks;\r\n        this.email = email;\r\n        this.aws = aws;\r\n        this.scheduler = new _Scheduler__WEBPACK_IMPORTED_MODULE_3__[\"Scheduler\"]({ queueItemTimeout, system: this });\r\n        this.nodemailer = this.generateNodemailer();\r\n    }\r\n    ;\r\n    generateNodemailer() {\r\n        var _a;\r\n        const { accessKeyId, secretAccessKey } = this.aws;\r\n        const ses = new aws_sdk__WEBPACK_IMPORTED_MODULE_0__[\"SES\"]({ accessKeyId, secretAccessKey, apiVersion: (_a = this.aws.ses.version) !== null && _a !== void 0 ? _a : AWS_SES_DEFAULT_VERSION });\r\n        const nodemailer = nodemailer__WEBPACK_IMPORTED_MODULE_1___default.a.createTransport({ SES: ses });\r\n        return nodemailer;\r\n    }\r\n    ;\r\n}\r\n;\r\n\n\n//# sourceURL=webpack:///./src/Modules/index.ts?");

/***/ }),

/***/ "@chris-talman/isomorphic-utilities":
/*!*****************************************************!*\
  !*** external "@chris-talman/isomorphic-utilities" ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"@chris-talman/isomorphic-utilities\");\n\n//# sourceURL=webpack:///external_%22@chris-talman/isomorphic-utilities%22?");

/***/ }),

/***/ "aws-sdk":
/*!**************************!*\
  !*** external "aws-sdk" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"aws-sdk\");\n\n//# sourceURL=webpack:///external_%22aws-sdk%22?");

/***/ }),

/***/ "nodemailer":
/*!*****************************!*\
  !*** external "nodemailer" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"nodemailer\");\n\n//# sourceURL=webpack:///external_%22nodemailer%22?");

/***/ })

/******/ });
});