import { capitalizeText } from '../textUtils';

describe('capitalizeText', () => {
    it('debe capitalizar una sola palabra', () => {
        expect(capitalizeText('juan')).toBe('Juan');
    });

    it('debe capitalizar varias palabras y poner en minúsculas el resto', () => {
        expect(capitalizeText('jUaN péRez')).toBe('Juan Pérez');
    });

    it('debe funcionar con cadenas vacías', () => {
        expect(capitalizeText('')).toBe('');
    });

    it('debe dejar signos y números sin modificar', () => {
        expect(capitalizeText('casa 123-a')).toBe('Casa 123-A');
    });

    it('debe funcionar con nombres compuestos', () => {
        expect(capitalizeText('MARÍA-josé SAN MARTíN')).toBe('María-José San Martín');
    });
});
