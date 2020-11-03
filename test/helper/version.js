/**
 * @description test for `version` part of lib helper
 * @author sessionid
 */

require('chai').should();
const { version } = require('../../lib/helper');

describe('module::helper.version', () => {
    it('#gt()', () => {
        version.gt('12.0.0', '12.0.0').should.eq(false);
        version.gt('12.0.0', '12.0.1').should.eq(false);
        version.gt('12.12.1', '12.13.0').should.eq(false);
        version.gt('12.12.12', '12.12.0').should.eq(true);
        version.gt('12.14.1', '12.13.5').should.eq(true);
    });

    it('#geq()', () => {
        version.geq('12.0.0', '12.0.0').should.eq(true);
        version.geq('12.0.0', '12.0.1').should.eq(false);
        version.geq('12.12.1', '12.13.0').should.eq(false);
        version.geq('12.12.12', '12.12.0').should.eq(true);
        version.geq('12.14.1', '12.13.5').should.eq(true);
    });

    it('#lt()', () => {
        version.lt('12.0.0', '12.0.0').should.eq(false);
        version.lt('12.0.0', '12.0.1').should.eq(true);
        version.lt('12.12.1', '12.13.0').should.eq(true);
        version.lt('12.12.12', '12.12.0').should.eq(false);
        version.lt('12.14.1', '12.13.5').should.eq(false);
    });

    it('#leq()', () => {
        version.leq('12.0.0', '12.0.0').should.eq(true);
        version.leq('12.0.0', '12.0.1').should.eq(true);
        version.leq('12.12.1', '12.13.0').should.eq(true);
        version.leq('12.12.12', '12.12.0').should.eq(false);
        version.leq('12.14.1', '12.13.5').should.eq(false);
    });

    it('#eq()', () => {
        version.eq('12.0.0', '12.0.0').should.eq(true);
        version.eq('12.0.0', '12.0.1').should.eq(false);
        version.eq('12.12.1', '12.13.0').should.eq(false);
    });

    it('#neq()', () => {
        version.neq('12.0.0', '12.0.0').should.eq(false);
        version.neq('12.0.0', '12.0.1').should.eq(true);
        version.neq('12.12.1', '12.13.0').should.eq(true);
    });
});
