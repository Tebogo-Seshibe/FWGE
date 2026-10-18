import { TypedArrayConstructor } from "./types";

export type SubDataView =
{ 
    [viewKey: string]:
    {
        type: TypedArrayConstructor;
        length: number;
    }
}

export type MappedSubDataView<T extends SubDataView> =
{
    [Key in keyof T]: T[Key]['type']['prototype']
}

export class CompositeDataView<T extends SubDataView> extends ArrayBuffer
{
    private readonly _views: MappedSubDataView<T> = Object.create(null);

    constructor(views: T)
    {
        super(
            Object.keys(views)
                .map(view => views[view].length * views[view].type.BYTES_PER_ELEMENT)
                .reduce((total, current) => total + current, 0)
        );

        let offset = 0;
        Object.keys(views)
            .map(view => (
            {
                view: view,
                type: views[view].type,
                length: views[view].length,
            }))
            .sort((a, b) => b.type.BYTES_PER_ELEMENT - a.type.BYTES_PER_ELEMENT)
            .forEach(({ view, type, length }) =>
            {
                const totalLength = type.BYTES_PER_ELEMENT * length;
                
                this._views[view as keyof T] = new type(this, offset, length);
                
                offset += totalLength;
            });
    }

    View<Key extends keyof MappedSubDataView<T>>(key: Key): MappedSubDataView<T>[Key]
    {
        return this._views[key];
    }
}
