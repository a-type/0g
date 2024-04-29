var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "typedoc/dist/lib/converter/components", "typedoc/dist/lib/converter/converter", "typedoc/dist/lib/models/reflections", "typedoc/dist/lib/models/reflections/abstract", "./getRawComment", "./typedocVersionCompatibility"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InternalExternalPlugin = void 0;
    const components_1 = require("typedoc/dist/lib/converter/components");
    const converter_1 = require("typedoc/dist/lib/converter/converter");
    const reflections_1 = require("typedoc/dist/lib/models/reflections");
    const abstract_1 = require("typedoc/dist/lib/models/reflections/abstract");
    const getRawComment_1 = require("./getRawComment");
    const typedocVersionCompatibility_1 = require("./typedocVersionCompatibility");
    function setExternal(flags, isExternal) {
        if (typeof flags.setFlag === 'function') {
            flags.setFlag(abstract_1.ReflectionFlag.External, isExternal);
        }
        else {
            // probably not needed, but won't hurt
            flags.isExternal = isExternal;
        }
    }
    /**
     * This plugin allows you to specify if a symbol is internal or external.
     *
     * Add @internal or @external to the docs for a symbol.
     *
     * #### Example:
     * ```
     * &#47;**
     *  * @internal
     *  *&#47;
     * let foo = "123
     *
     * &#47;**
     *  * @external
     *  *&#47;
     * let bar = "123
     * ```
     */
    let InternalExternalPlugin = /** @class */ (() => {
        var InternalExternalPlugin_1;
        let InternalExternalPlugin = InternalExternalPlugin_1 = class InternalExternalPlugin extends components_1.ConverterComponent {
            initialize() {
                this.listenTo(this.owner, {
                    [converter_1.Converter.EVENT_BEGIN]: this.readOptions,
                    [converter_1.Converter.EVENT_CREATE_SIGNATURE]: this.onSignature,
                    [converter_1.Converter.EVENT_CREATE_DECLARATION]: this.onDeclaration,
                    [converter_1.Converter.EVENT_FILE_BEGIN]: this.onFileBegin,
                });
            }
            static markSignatureAndMethod(reflection, external) {
                setExternal(reflection.flags, external);
                // if (reflection.parent && (reflection.parent.kind === ReflectionKind.Method || reflection.parent.kind === ReflectionKind.Function) {
                if (reflection.parent && reflection.parent.kind & reflections_1.ReflectionKind.FunctionOrMethod) {
                    setExternal(reflection.parent.flags, external);
                }
            }
            readOptions() {
                const { options } = this.application;
                this.externals = (options.getValue('external-aliases') || 'external').split(',');
                this.internals = (options.getValue('internal-aliases') || 'internal').split(',');
                this.externalRegex = new RegExp(`@(${this.externals.join('|')})\\b`);
                this.internalRegex = new RegExp(`@(${this.internals.join('|')})\\b`);
            }
            /**
             * Triggered when the converter has created a declaration reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param reflection  The reflection that is currently processed.
             * @param node  The node that is currently processed if available.
             */
            onSignature(context, reflection, node) {
                if (!reflection.comment)
                    return;
                // Look for @internal or @external
                let comment = reflection.comment;
                if (this.internals.some((tag) => comment.hasTag(tag))) {
                    InternalExternalPlugin_1.markSignatureAndMethod(reflection, false);
                }
                else if (this.externals.some((tag) => comment.hasTag(tag))) {
                    InternalExternalPlugin_1.markSignatureAndMethod(reflection, true);
                }
                this.internals.forEach((tag) => typedocVersionCompatibility_1.removeTags(comment, tag));
                this.externals.forEach((tag) => typedocVersionCompatibility_1.removeTags(comment, tag));
            }
            /**
             * Triggered when the converter has created a declaration reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param reflection  The reflection that is currently processed.
             * @param node  The node that is currently processed if available.
             */
            onDeclaration(context, reflection, node) {
                if (!reflection.comment)
                    return;
                // Look for @internal or @external
                let comment = reflection.comment;
                if (this.internals.some((tag) => comment.hasTag(tag))) {
                    setExternal(reflection.flags, false);
                }
                else if (this.externals.some((tag) => comment.hasTag(tag))) {
                    setExternal(reflection.flags, true);
                }
                this.internals.forEach((tag) => typedocVersionCompatibility_1.removeTags(comment, tag));
                this.externals.forEach((tag) => typedocVersionCompatibility_1.removeTags(comment, tag));
            }
            /**
             * Triggered when the converter has started loading a file.
             *
             * This sets the file's context `isExternal` value if an annotation is found.
             * All symbols inside the file default to the file's `isExternal` value.
             *
             * The onFileBegin event is used because once the Declaration (which represents
             * the file) has been created, it's too late to update the context.
             * The declaration will also be processed during `onDeclaration` where the tags
             * will be removed from the comment.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param reflection  The reflection that is currently processed.
             * @param node  The node that is currently processed if available.
             */
            onFileBegin(context, reflection, node) {
                if (!node)
                    return;
                // Look for @internal or @external
                let comment = getRawComment_1.getRawComment(node);
                let internalMatch = this.internalRegex.exec(comment);
                let externalMatch = this.externalRegex.exec(comment);
                if (internalMatch) {
                    context.isExternal = false;
                }
                else if (externalMatch) {
                    context.isExternal = true;
                }
            }
        };
        InternalExternalPlugin = InternalExternalPlugin_1 = __decorate([
            components_1.Component({ name: 'internal-external' })
        ], InternalExternalPlugin);
        return InternalExternalPlugin;
    })();
    exports.InternalExternalPlugin = InternalExternalPlugin;
});
