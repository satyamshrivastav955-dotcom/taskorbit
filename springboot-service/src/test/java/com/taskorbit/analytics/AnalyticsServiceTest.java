package com.taskorbit.analytics;

import com.taskorbit.analytics.entity.TaskEntity;
import com.taskorbit.analytics.repository.TaskRepository;
import com.taskorbit.analytics.service.AnalyticsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
public class AnalyticsServiceTest {
  @Autowired
  private TestEntityManager em;
  @Autowired
  private TaskRepository tasks;

  private TaskEntity task(String id, String project, String assignee, String status, int revisions) {
    TaskEntity t = new TaskEntity();
    t.setId(id);
    t.setProjectId(project);
    t.setAssigneeId(assignee);
    t.setReviewerId("r1");
    t.setStartDate(LocalDate.of(2026, 10, 1));
    t.setDeadline(LocalDate.of(2026, 10, 5));
    t.setStatus(status);
    t.setRevisionCount(revisions);
    t.setHasConflict(0);
    return em.persist(t);
  }

  @Test
  public void completionPct() {
    task("t1", "p1", "a1", "approved", 0);
    task("t2", "p1", "a1", "todo", 1);
    AnalyticsService svc = new AnalyticsService(tasks, null);
    assertEquals(50.0, svc.summary("p1").getCompletionPct());
  }

  @Test
  public void perAssigneeStats() {
    task("t1", "p1", "a1", "approved", 2);
    task("t2", "p1", "a1", "todo", 0);
    AnalyticsService svc = new AnalyticsService(tasks, null);
    assertEquals(1, svc.byAssignee("p1").size());
    assertEquals(1.0, svc.byAssignee("p1").get(0).getAvgRevisions());
  }

  @Test
  public void reviewStatsPerReviewer() {
    com.taskorbit.analytics.entity.ReviewEntity r1 = new com.taskorbit.analytics.entity.ReviewEntity();
    r1.setReviewerId("kavya");
    r1.setDecision("approved");
    com.taskorbit.analytics.entity.ReviewEntity r2 = new com.taskorbit.analytics.entity.ReviewEntity();
    r2.setReviewerId("kavya");
    r2.setDecision("rejected");
    com.taskorbit.analytics.repository.ReviewRepository mock =
        org.mockito.Mockito.mock(com.taskorbit.analytics.repository.ReviewRepository.class);
    org.mockito.Mockito.when(mock.findAll()).thenReturn(java.util.List.of(r1, r2));
    AnalyticsService svc = new AnalyticsService(tasks, mock);
    assertEquals(1, svc.reviewStats().size());
    assertEquals(50.0, svc.reviewStats().get(0).getApprovalRate());
  }
}
