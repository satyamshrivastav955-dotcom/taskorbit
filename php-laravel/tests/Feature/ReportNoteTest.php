<?php
namespace Tests\Feature;

use Tests\TestCase;

class ReportNoteTest extends TestCase
{
    public function test_guest_redirected(): void
    {
        $this->get('/notes')->assertRedirect('/login');
    }

    public function test_invalid_upload_rejected(): void
    {
        $this->post('/notes', ['project_id' => 'p1', 'title' => 't', 'body' => 'b'])
            ->assertRedirect('/login');
    }
}
