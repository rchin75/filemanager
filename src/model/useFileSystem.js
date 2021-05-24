import {reactive, computed} from 'vue';

const state = reactive({
    files: [
        {
            name: 'Photos',
            size: '0',
            type: 'folder',
            created: new Date(),
            updated: new Date(),
            owner: 'Roy'
        },
        {
            name: 'test.txt',
            size: '1024',
            type: 'text/plain',
            created: new Date(),
            updated: new Date(),
            owner: 'Roy'
        },
        {
            name: 'photo01.jpg',
            size: '2048',
            type: 'image/jpeg',
            created: new Date(),
            updated: new Date(),
            owner: 'John'
        },
        {
            name: 'photo02.jpg',
            size: '4034',
            type: 'image/jpeg',
            created: new Date(),
            updated: new Date(),
            owner: 'Jane'
        }
    ],
    // Folders of the path. Note root is [].
    path: ['test','test2']
});

export default function useFileSystem() {

    const files = computed(() => state.files);
    const path = computed( () => state.path);

    return {
        files,
        path
    }
}
