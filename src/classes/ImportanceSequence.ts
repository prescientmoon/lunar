export class ImportanceSequence {
    private current = 0

    public next() {
        return ++this.current
    }

    public last() {
        return this.current
    }
}
