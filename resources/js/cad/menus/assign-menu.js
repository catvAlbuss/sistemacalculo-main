// resources/js/cad/menus/assign-menu.js

export const assignMenu = {
    getContent(cadSystem) {
        return `
            <div class="py-1 min-w-[280px]">

                <!-- ================= JOINT / POINT ================= -->
                <div class="relative group">
                    <button class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex justify-between items-center">
                        <span>Joint / Point</span>
                        <span>▶</span>
                    </button>

                    <div class="absolute left-full top-0 hidden group-hover:block bg-gray-800 border border-gray-700 shadow-lg min-w-[260px] z-50">
                        <button 
                            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                            onclick="window.cadSystem?.activateAssignMenuAction?.('joint-diaphragms')">
                            Diaphragms...
                        </button>

                        <button 
                            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                            onclick="window.cadSystem?.activateAssignMenuAction?.('joint-restraints')">
                            Restraints (Supports)...
                        </button>

                        <button 
                            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                            onclick="window.cadSystem?.activateAssignMenuAction?.('joint-springs')">
                            Point Springs...
                        </button>
                    </div>
                </div>


                <!-- ================= FRAME / LINE ================= -->
                <div class="relative group">
                    <button class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex justify-between items-center">
                        <span>Frame / Line</span>
                        <span>▶</span>
                    </button>

                    <div class="absolute left-full top-0 hidden group-hover:block bg-gray-800 border border-gray-700 shadow-lg min-w-[280px] z-50">
                        <button 
                            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                            onclick="window.cadSystem?.activateAssignMenuAction?.('frame-section')">
                            Frame Section...
                        </button>

                        <button 
                            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                            onclick="window.cadSystem?.activateAssignMenuAction?.('frame-releases')">
                            Frame Releases / Partial Fixity...
                        </button>

                        <button
                            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                            onclick="window.cadSystem?.activateAssignMenuAction?.('frame-end-offsets')">
                            End (Length) Offsets...
                        </button>
                    </div>
                </div>


                <div class="border-t border-gray-700 my-1"></div>


                <!-- ================= JOINT / POINT LOADS ================= -->
                <div class="relative group">
                    <button class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex justify-between items-center">
                        <span>Joint / Point Loads</span>
                        <span>▶</span>
                    </button>

                    <div class="absolute left-full top-0 hidden group-hover:block bg-gray-800 border border-gray-700 shadow-lg min-w-[260px] z-50">
                        <button 
                            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                            onclick="window.cadSystem?.activateAssignMenuAction?.('joint-load-force')">
                            Force...
                        </button>

                        <button 
                            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                            onclick="window.cadSystem?.activateAssignMenuAction?.('joint-load-ground-displacement')">
                            Ground Displacement...
                        </button>

                        <button 
                            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                            onclick="window.cadSystem?.activateAssignMenuAction?.('joint-load-temperature')">
                            Temperature...
                        </button>
                    </div>
                </div>


                <!-- ================= FRAME / LINE LOADS ================= -->
                <div class="relative group">
                    <button class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex justify-between items-center">
                        <span>Frame / Line Loads</span>
                        <span>▶</span>
                    </button>

                    <div class="absolute left-full top-0 hidden group-hover:block bg-gray-800 border border-gray-700 shadow-lg min-w-[260px] z-50">
                        <button 
                            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                            onclick="window.cadSystem?.activateAssignMenuAction?.('frame-load-point')">
                            Point...
                        </button>

                        <button 
                            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                            onclick="window.cadSystem?.activateAssignMenuAction?.('frame-load-distributed')">
                            Distributed...
                        </button>

                        <button 
                            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                            onclick="window.cadSystem?.activateAssignMenuAction?.('frame-load-temperature')">
                            Temperature...
                        </button>
                    </div>
                </div>


                <div class="border-t border-gray-700 my-1"></div>


                <!-- ================= GROUP NAMES ================= -->
                <button 
                    class="w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                    onclick="window.cadSystem?.activateAssignMenuAction?.('group-names')">
                    Group Names...
                </button>

            </div>
        `;
    }
};