/*
 * S-Plan
 * Copyright (c) 2021 Nils Witt
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *   * Redistributions of source code must retain the above copyright notice, this
 *     list of conditions and the following disclaimer.
 *   * Redistributions in binary form must reproduce the above copyright notice,
 *     this list of conditions and the following disclaimer in the documentation
 *     and/or other materials provided with the distribution.
 *   * Neither the name of the author nor the names of its
 *     contributors may be used to endorse or promote products derived from
 *     this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


let timetable: TimeTable = null;

//EventListener
/**
 * Triggers: Page fully loaded (HTML)
 */
addEventListener("DOMContentLoaded", async () => {
    await initPage();
});

/**
 * Triggers: User changes focus back on site
 */
addEventListener("visibilitychange", async () => {
    //await fetchData();
});

/**
 * Triggers: When data in database is updated
 */
addEventListener("storesUpdated", async () => {
    if (timetable != null) {
        await timetable.updateTable();
    }
});

// User Interaction

function closeDetailView() {
    document.getElementById("detailFrame").style.visibility = "hidden";
    document.getElementById("detailBox").style.visibility = "hidden";
}

async function initPage() {
    try {
        await DatabaseConnector.initDB();
        this.timetable = new TimeTable();

        /* Page Objects*/
        this.timetable.buttonPreviousWeek = document.getElementById('previousWeek');
        this.timetable.buttonCurrentWeek = document.getElementById('currentWeek');
        this.timetable.buttonNextWeek = document.getElementById('nextWeek');
        this.timetable.detailViewCourseName = document.getElementById("detailViewCourseName");
        this.timetable.detailViewLesson = document.getElementById("detailViewLesson");
        this.timetable.detailViewRoom = document.getElementById("detailViewRoom");
        this.timetable.detailViewStatus = document.getElementById("detailViewStatus");
        this.timetable.detailFrame = document.getElementById("detailFrame");
        this.timetable.detailBox = document.getElementById("detailBox");

        this.timetable.initPagination();
        TimeTable.updatePagination(this.timetable, 0);


        //TODO updateData
    } catch (e) {
        console.error(e);
    }
}
